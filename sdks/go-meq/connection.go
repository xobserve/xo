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
package meq

import (
	"bufio"
	"errors"
	"math/rand"
	"net"
	"time"

	"github.com/meqio/meq/proto"
	"github.com/meqio/meq/proto/mqtt"
	"go.uber.org/zap"
)

type ConfigOption struct {
	Username string
	Hosts    []string
}

type Connection struct {
	subs  map[string]*sub
	subid map[uint16][][]byte

	conn   net.Conn
	close  chan struct{}
	closed bool

	msgid uint16

	pubmsgh PubMsgHandler
	unreadh UnreadHandler

	logger *zap.Logger
}

type sub struct {
	ch    chan *proto.PubMsg
	acked bool
}

func Connect(conf *ConfigOption) (*Connection, error) {
	if len(conf.Hosts) == 0 {
		return nil, errors.New("meq servers hosts cant be empty")
	}

	c := &Connection{
		close:  make(chan struct{}, 1),
		logger: initLogger(),
	}

	c.subs = make(map[string]*sub)
	c.subid = make(map[uint16][][]byte)
	host := conf.Hosts[rand.Intn(len(conf.Hosts))]
	conn, err := net.Dial("tcp", host)
	if err != nil {
		c.logger.Debug("dial to server error", zap.String("host", host), zap.Error(err))
		return nil, err
	}

	// connect to server
	ack := mqtt.Connect{}
	ack.Username = []byte(conf.Username)
	ack.UsernameFlag = true
	if _, err := ack.EncodeTo(conn); err != nil {
		return nil, err
	}

	// wait for connect ack sent from server
	reader := bufio.NewReaderSize(conn, 65536)
	conn.SetDeadline(time.Now().Add(time.Second * proto.MAX_IDLE_TIME))

	msg, err := mqtt.DecodePacket(reader)
	if err != nil {
		return nil, err
	}

	if msg.Type() == mqtt.TypeOfConnack {
		c.conn = conn

		go c.ping()

		go c.loop(conf)

		return c, nil
	}

	return nil, errors.New("connecting to sever failed")
}

var subretries = 0

func (c *Connection) loop(conf *ConfigOption) {
	for !c.closed {
		c.readLoop()
		host := conf.Hosts[rand.Intn(len(conf.Hosts))]
		conn, err := net.Dial("tcp", host)
		if err != nil {
			c.logger.Debug("dial to server error", zap.String("host", host), zap.Error(err))
			time.Sleep(2000 * time.Millisecond)
			continue
		}

		// connect to server
		ack := mqtt.Connect{}
		ack.Username = []byte(conf.Username)
		ack.UsernameFlag = true
		if _, err := ack.EncodeTo(conn); err != nil {
			time.Sleep(2000 * time.Millisecond)
			continue
		}

		// wait for connect ack sent from server
		reader := bufio.NewReaderSize(conn, 65536)
		conn.SetDeadline(time.Now().Add(time.Second * proto.MAX_IDLE_TIME))

		msg, err := mqtt.DecodePacket(reader)
		if err != nil {
			time.Sleep(2000 * time.Millisecond)
			continue
		}

		if msg.Type() != mqtt.TypeOfConnack {
			conn.Close()
			time.Sleep(2000 * time.Millisecond)
			continue
		}

		c.conn = conn

		go func() {
			time.Sleep(2000 * time.Millisecond)
			// 重新订阅所有历史topic
			for topic := range c.subs {
				c.Subscribe([]byte(topic))
			}
		}()
	}
}

func (c *Connection) Close() {
	c.closed = true

	c.conn.Close()
	c.close <- struct{}{}

}

func (c *Connection) readLoop() error {
	defer func() {
		c.conn.Close()
	}()

	reader := bufio.NewReaderSize(c.conn, 65536)
	for {
		c.conn.SetDeadline(time.Now().Add(time.Second * MAX_CONNECTION_IDLE_TIME))

		msg, err := mqtt.DecodePacket(reader)
		if err != nil {
			return err
		}

		switch msg.Type() {
		case mqtt.TypeOfPublish:
			m := msg.(*mqtt.Publish)
			pl := m.Payload
			if len(pl) > 0 {
				switch pl[0] {
				case proto.MSG_COUNT:
					count := proto.UnpackMsgCount(pl[1:])
					c.unreadh(m.Topic, count)
				case proto.MSG_PUB_BATCH:
					msgs, _ := proto.UnpackPubBatch(pl[1:])
					for _, m := range msgs {
						c.pubmsgh(m)
					}
				case proto.MSG_PUB_ONE:
					msg, _ := proto.UnpackMsg(pl[1:])
					c.pubmsgh(msg)
				}
			}

		case mqtt.TypeOfSuback:
			m := msg.(*mqtt.Suback)
			topics, ok := c.subid[m.MessageID]
			if ok {
				for _, topic := range topics {
					sub, ok := c.subs[string(topic)]
					if ok {
						sub.acked = true
					}
				}
			}
		case mqtt.TypeOfPingresp:

		}
	}
}

func (c *Connection) ping() {
	for {
		select {
		case <-time.NewTicker(10 * time.Second).C:
			m := mqtt.Pingreq{}
			m.EncodeTo(c.conn)
		case <-c.close:
			return
		}
	}
}
