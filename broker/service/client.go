//  Copyright © 2018 Sunface <CTO@188.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package service

import (
	"bufio"
	"errors"
	"fmt"
	"net"
	"strconv"
	"time"

	"github.com/sunface/talent"

	"github.com/cosmos-gg/meq/proto"
	"github.com/cosmos-gg/meq/proto/mqtt"
	"go.uber.org/zap"
)

// For controlling dynamic buffer sizes.
const (
	headerSize  = 4
	maxBodySize = 65536 * 16 // 1MB
)

type client struct {
	cid  uint64 // do not exceeds max(int32)
	conn net.Conn
	bk   *Broker

	msgSender chan []*proto.PubMsg

	subs map[string]struct{}

	username []byte

	rawMsgCache map[string]struct{}

	closed  bool
	closech chan struct{}
}

func initClient(cid uint64, conn net.Conn, bk *Broker) *client {
	return &client{
		cid:       cid,
		conn:      conn,
		bk:        bk,
		msgSender: make(chan []*proto.PubMsg, MAX_CHANNEL_LEN),
		subs:      make(map[string]struct{}),
		closech:   make(chan struct{}),
	}
}
func (c *client) readLoop(isWs bool) error {
	defer func() {
		c.closed = true
		c.closech <- struct{}{}
		// unsub topics
		for topic := range c.subs {
			t := []byte(topic)
			tp := proto.GetTopicType(t)
			if tp == proto.TopicTypeChat {
				// because when we send a message to a chat topic,we will add one unread count for every user,
				// so when unconnected,we need to se chat topic's unread count to 0
				c.bk.store.UpdateUnreadCount(t, c.username, false, 0)

				// notify to all the user in topic ,that someone has been offline
				if tp == proto.TopicTypeChat {
					notifyOnline(c.bk, t, proto.PackOfflineNotify(t, c.username))
				}
			}
			c.bk.subtrie.UnSubscribe(t, c.cid, c.bk.cluster.peer.name)

			//@todo
			// aync + batch
			submsg := SubMessage{CLUSTER_UNSUB, []byte(topic), c.cid, []byte("")}
			c.bk.cluster.peer.send.GossipBroadcast(submsg)
		}
		if err := recover(); err != nil {
			L.Info("read loop panic:", zap.Error(err.(error)), zap.Stack("stack"))
			return
		}
	}()

	reader := bufio.NewReaderSize(c.conn, 65536)
	for !c.closed {
		c.conn.SetDeadline(time.Now().Add(time.Second * proto.MAX_IDLE_TIME))
		msg, err := mqtt.DecodePacket(reader)
		if err != nil {
			return err
		}
		switch msg.Type() {
		case mqtt.TypeOfSubscribe:
			packet := msg.(*mqtt.Subscribe)
			for _, sub := range packet.Subscriptions {
				t := sub.Topic
				err := c.bk.subtrie.Subscribe(t, c.cid, c.bk.cluster.peer.name, c.username)
				if err != nil {
					L.Info("sub error", zap.ByteString("topic", t))
					return err
				}
				submsg := SubMessage{CLUSTER_SUB, t, c.cid, c.username}
				c.bk.cluster.peer.send.GossipBroadcast(submsg)

				c.subs[string(t)] = struct{}{}
				//@todo
				count := c.bk.store.UnreadCount(t, c.username)
				// push out the count of the unread messages
				msg := mqtt.Publish{
					Header: &mqtt.StaticHeader{
						QOS: 0,
					},
					Topic:   t,
					Payload: proto.PackMsgCount(count),
				}
				msg.EncodeTo(c.conn)

				// check the topic is TopicTypeChat
				// notify to all the user in topic ,that someone has been online
				tp := proto.GetTopicType(t)

				if tp == proto.TopicTypeChat {
					notifyOnline(c.bk, t, proto.PackOnlineNotify(t, c.username))
				}
			}

			ack := mqtt.Suback{
				MessageID: packet.MessageID,
			}
			ack.EncodeTo(c.conn)
		case mqtt.TypeOfUnsubscribe:

		case mqtt.TypeOfPingreq:
			pong := mqtt.Pingresp{}
			pong.EncodeTo(c.conn)
		case mqtt.TypeOfDisconnect:
			return nil

		case mqtt.TypeOfPublish:
			packet := msg.(*mqtt.Publish)
			if len(packet.Payload) > 0 {
				cmd := packet.Payload[0]
				switch cmd {
				case proto.MSG_PULL:
					count, offset := proto.UnPackPullMsg(packet.Payload[1:])
					// pulling out the all messages is not allowed
					if count > MAX_MESSAGE_PULL_COUNT || count < 0 {
						return fmt.Errorf("the pull count %d is larger than :%d or smaller than 0", count, MAX_MESSAGE_PULL_COUNT)
					}

					// check the topic is already subed
					_, ok := c.subs[string(packet.Topic)]
					if !ok {
						return errors.New("pull messages without subscribe the topic:" + string(packet.Topic))
					}

					msgs := c.bk.store.Query(packet.Topic, count, offset, true)
					if len(msgs) > 0 {
						c.msgSender <- msgs
					}
				case proto.MSG_PUB_BATCH: //batch pub
					// clients publish  messages to a concrete topic
					// single publish will store the messages according to the message qos
					ms, err := proto.UnpackPubBatch(packet.Payload[1:])
					if err != nil {
						return err
					}

					now := time.Now().Unix()
					for _, m := range ms {
						// gen msg id
						m.ID = c.bk.idgen.Generate().Bytes()
						m.Sender = c.username
						// validate msg
						_, _, _, err := proto.AppidAndSendTag(m.Topic)
						if err != nil {
							L.Info("pub msg topic invalid", zap.Error(err), zap.ByteString("topic", m.Topic))
							continue
						}
						// update the ttl to a unix time
						if m.TTL != proto.NeverExpires {
							m.TTL = now + m.TTL
						}
					}

					// save the messages
					c.bk.store.Store(ms)
					// push to online clients in all nodes
					publishOnline(c.cid, c.bk, ms, false)

					// ack to mqtt client
					if packet.Header.QOS == 1 {
						msg := mqtt.Puback{packet.MessageID}
						msg.EncodeTo(c.conn)
					}
				case proto.MSG_PUB_ONE: // single pub
					// clients publish  messages to a concrete topic
					// single publish will store the messages according to the message qos
					m, err := proto.UnpackMsg(packet.Payload[1:])
					if err != nil {
						return err
					}
					// validate msg
					_, _, _, err = proto.AppidAndSendTag(m.Topic)
					if err != nil {
						L.Info("pub msg topic invalid", zap.Error(err), zap.ByteString("topic", m.Topic))
						continue
					}

					now := time.Now().Unix()
					// generate messageID
					id := c.bk.idgen.Generate()
					m.ID = id.Bytes()
					c.bk.idgen.Generate().Time()
					// set sender user
					m.Sender = c.username
					// update the ttl to a unix time
					if m.TTL != proto.NeverExpires {
						m.TTL = now + m.TTL
					}

					m.Timestamp = talent.String2Bytes(strconv.FormatInt(id.Time(), 10))
					// save the messages
					ms := []*proto.PubMsg{m}
					c.bk.store.Store(ms)

					// push to online clients in all nodes
					publishOnline(c.cid, c.bk, ms, false)

					// ack to mqtt client
					if packet.Header.QOS == 1 {
						msg := mqtt.Puback{packet.MessageID}
						msg.EncodeTo(c.conn)
					}
				case proto.MSG_BROADCAST:
					// clients publish messges to a broadcast topic
					// broadcast will not store the messages
					m, err := proto.UnpackMsg(packet.Payload[1:])
					if err != nil {
						return err
					}
					// gen msg id
					m.ID = c.bk.idgen.Generate().Bytes()

					ms := []*proto.PubMsg{m}
					publishOnline(c.cid, c.bk, ms, true)

				case proto.MSG_REDUCE_COUNT:
					topic := packet.Topic
					count := proto.UnpackReduceCount(packet.Payload[1:])
					if count < 0 {
						return fmt.Errorf("malice ack count, topic:%s,count:%d", string(topic), count)
					}

					c.bk.store.UpdateUnreadCount(topic, c.username, false, count)
				case proto.MSG_MARK_READ: // clients receive the publish message
					topic, msgids := proto.UnpackMarkRead(packet.Payload[1:])
					if len(msgids) > 0 {
						// ack the messages
						c.bk.store.MarkRead(topic, msgids)
					}

				case proto.MSG_PRESENCE_ALL:
					topic := proto.UnpackPresence(packet.Payload[1:])
					users := c.bk.subtrie.GetPrensence(topic)
					msg := mqtt.Publish{
						Header: &mqtt.StaticHeader{
							QOS: 0,
						},
						Topic:   topic,
						Payload: proto.PackPresenceUsers(users, proto.MSG_PRESENCE_ALL),
					}
					msg.EncodeTo(c.conn)

				case proto.MSG_ALL_CHAT_USERS:
					topic := proto.UnpackAllChatUsers(packet.Payload[1:])
					users := c.bk.store.GetChatUsers(topic)
					msg := mqtt.Publish{
						Header: &mqtt.StaticHeader{
							QOS: 0,
						},
						Topic:   topic,
						Payload: proto.PackPresenceUsers(users, proto.MSG_ALL_CHAT_USERS),
					}
					msg.EncodeTo(c.conn)

				case proto.MSG_JOIN_CHAT:
					topic := proto.UnpackJoinChat(packet.Payload[1:])
					// validate msg
					_, _, _, err := proto.AppidAndSendTag(topic)
					if err != nil {
						L.Info("leave chat topic invalid", zap.Error(err), zap.ByteString("topic", topic))
						return err
					}

					// check the topic is TopicTypeChat
					tp := proto.GetTopicType(topic)

					if tp == proto.TopicTypeChat {
						c.bk.store.JoinChat(topic, c.username)
						notifyOnline(c.bk, topic, proto.PackJoinChatNotify(topic, c.username))
					}

				case proto.MSG_LEAVE_CHAT:
					topic := proto.UnpackLeaveChat(packet.Payload[1:])
					// validate msg
					_, _, _, err := proto.AppidAndSendTag(topic)
					if err != nil {
						L.Info("leave chat topic invalid", zap.Error(err), zap.ByteString("topic", topic))
						return err
					}

					tp := proto.GetTopicType(topic)

					if tp == proto.TopicTypeChat {
						c.bk.store.LeaveChat(topic, c.username)
						notifyOnline(c.bk, topic, proto.PackLeaveChatNotify(topic, c.username))
					}

				case proto.MSG_RETRIEVE:
					topic, msgid := proto.UnpackRetrieve(packet.Payload[1:])
					err := c.bk.store.Del(topic, msgid)
					if err == nil {
						notifyOnline(c.bk, topic, packet.Payload)
					}
				}
			}
		}
	}

	// Start read buffer.
	// header := make([]byte, headerSize)
	// for !c.closed {
	// 	// read header
	// 	var bl uint64
	// 	if _, err := talent.ReadFull(c.conn, header, proto.MAX_IDLE_TIME); err != nil {
	// 		return err
	// 	}
	// 	if bl, _ = binary.Uvarint(header); bl <= 0 || bl >= maxBodySize {
	// 		return fmt.Errorf("packet not valid,header:%v,bl:%v", header, bl)
	// 	}

	// 	// read body
	// 	buf := make([]byte, bl)
	// 	if _, err := talent.ReadFull(c.conn, buf, proto.MAX_IDLE_TIME); err != nil {
	// 		return err
	// 	}
	// 	switch buf[0] {

	// 	case proto.MSG_UNSUB: // clients unsubscribe the specify topic
	// 		topic, group := proto.UnpackSub(buf[1:])
	// 		if topic == nil {
	// 			return errors.New("the unsub topic is null")
	// 		}

	// 		c.bk.subtrie.UnSubscribe(topic, group, c.cid, c.bk.cluster.peer.name)
	// 		//@todo
	// 		// aync + batch
	// 		submsg := SubMessage{CLUSTER_UNSUB, topic, group, c.cid}
	// 		c.bk.cluster.peer.send.GossipBroadcast(submsg)

	// 		delete(c.subs, string(topic))

	// 	case proto.MSG_PUB_TIMER, proto.MSG_PUB_RESTORE:
	// 		m := proto.UnpackTimerMsg(buf[1:])
	// 		now := time.Now().Unix()
	// 		// trigger first
	// 		if m.Trigger == 0 {
	// 			if m.Delay != 0 {
	// 				m.Trigger = now + int64(m.Delay)
	// 			}
	// 		}
	// 		if m.Trigger > now {
	// 			c.bk.store.PutTimerMsg(m)
	// 		}

	// 		// ack the timer msg
	// 		c.ackSender <- []proto.Ack{proto.Ack{m.Topic, m.ID}}
	// 	}
	// }

	return nil
}

func (c *client) writeLoop() {
	defer func() {
		c.closed = true
		c.conn.Close()
		if err := recover(); err != nil {
			L.Warn("panic happend in write loop", zap.Error(err.(error)), zap.Stack("stack"), zap.Uint64("cid", c.cid))
			return
		}
	}()

	for {
		select {
		case msgs := <-c.msgSender:
			err := publishOne(c.conn, msgs)
			if err != nil {
				L.Info("push one error", zap.Error(err))
				return
			}
		case <-c.closech:
			return
		}
	}
}

func (c *client) waitForConnect() error {
	reader := bufio.NewReaderSize(c.conn, 65536)
	c.conn.SetDeadline(time.Now().Add(time.Second * proto.MAX_IDLE_TIME))

	msg, err := mqtt.DecodePacket(reader)
	if err != nil {
		return err
	}

	if msg.Type() == mqtt.TypeOfConnect {
		packet := msg.(*mqtt.Connect)
		if len(packet.Username) <= 0 {
			return errors.New("no username exist")
		}
		c.username = packet.Username

		// reply the connect ack
		ack := mqtt.Connack{ReturnCode: 0x00}
		if _, err := ack.EncodeTo(c.conn); err != nil {
			return err
		}
		return nil
	}

	return errors.New("first packet is not MSG_CONNECT")
}
