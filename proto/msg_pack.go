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
package proto

import (
	"encoding/binary"

	"github.com/golang/snappy"
)

func PackMsg(m *PubMsg) []byte {
	ml := len(m.ID)
	tl := len(m.Topic)
	pl := len(m.Payload)
	// header
	msg := make([]byte, 20+ml+tl+pl)
	msg[0] = MSG_PUB_ONE
	// msgid
	binary.LittleEndian.PutUint16(msg[1:3], uint16(ml))
	copy(msg[3:3+ml], m.ID)

	// payload
	binary.LittleEndian.PutUint32(msg[3+ml:7+ml], uint32(pl))
	copy(msg[7+ml:7+ml+pl], m.Payload)

	// acked
	if m.Acked {
		msg[7+ml+pl] = '1'
	} else {
		msg[7+ml+pl] = '0'
	}

	// topic
	binary.LittleEndian.PutUint16(msg[8+ml+pl:10+ml+pl], uint16(len(m.Topic)))
	copy(msg[10+ml+pl:10+ml+pl+tl], m.Topic)

	// type
	msg[10+ml+pl+tl] = byte(m.Type)
	// qos
	msg[11+ml+pl+tl] = byte(m.QoS)
	//ttl
	binary.LittleEndian.PutUint64(msg[12+ml+pl+tl:20+ml+pl+tl], uint64(m.TTL))

	return msg
}

func UnpackMsg(b []byte) (*PubMsg, error) {
	// msgid
	ml := uint32(binary.LittleEndian.Uint16(b[:2]))
	msgid := b[2 : 2+ml]

	// payload
	pl := binary.LittleEndian.Uint32(b[2+ml : 6+ml])
	payload := b[6+ml : 6+ml+pl]

	//acked
	var acked bool
	if b[6+ml+pl] == '1' {
		acked = true
	}

	// topic
	tl := uint32(binary.LittleEndian.Uint16(b[7+ml+pl : 9+ml+pl]))
	topic := b[9+ml+pl : 9+ml+pl+tl]

	// type
	tp := b[9+ml+pl+tl]
	// qos
	qos := b[10+ml+pl+tl]
	// ttl
	ttl := binary.LittleEndian.Uint64(b[11+ml+pl+tl : 19+ml+pl+tl])
	return &PubMsg{msgid, topic, payload, acked, int8(tp), int8(qos), int64(ttl)}, nil
}

func PackSub(topic []byte) []byte {
	tl := len(topic)

	msg := make([]byte, 4+1+2+tl)
	// 设置header
	binary.LittleEndian.PutUint32(msg[:4], 1+2+uint32(tl))
	// 设置control flag
	msg[4] = MSG_SUB

	// topic len
	binary.LittleEndian.PutUint16(msg[5:7], uint16(tl))
	// topic
	copy(msg[7:7+tl], topic)

	return msg
}

func UnpackSub(b []byte) []byte {
	// read topic length
	var tl uint16
	if tl = binary.LittleEndian.Uint16(b[:2]); tl <= 0 {
		return nil
	}

	return b[2 : 2+tl]
}

func PackSubAck(t []byte) []byte {
	tl := uint32(len(t))
	msg := make([]byte, 4+1+tl)
	binary.LittleEndian.PutUint32(msg[:4], 1+tl)
	msg[4] = MSG_SUBACK

	copy(msg[5:], t)

	return msg
}

func UnpackSubAck(b []byte) []byte {
	return b
}

func PackMarkRead(topic []byte, msgids [][]byte) []byte {
	tl := len(topic)
	total := 3 + 2*len(msgids) + tl
	for _, id := range msgids {
		total += len(id)
	}
	body := make([]byte, total)

	//command
	body[0] = MSG_MARK_READ
	//topic
	binary.LittleEndian.PutUint16(body[1:3], uint16(tl))
	copy(body[3:3+tl], topic)
	//msgids
	last := 3 + tl
	for _, id := range msgids {
		ml := len(id)
		binary.LittleEndian.PutUint16(body[last:last+2], uint16(ml))
		copy(body[last+2:last+2+ml], id)
		last = last + 2 + ml
	}

	return body
}

func UnpackMarkRead(b []byte) ([]byte, [][]byte) {
	var msgids [][]byte

	tl := binary.LittleEndian.Uint16(b[:2])
	topic := b[2 : 2+tl]

	last := uint32(2 + tl)
	bl := uint32(len(b))
	for {
		if last >= bl {
			break
		}

		ml := uint32(binary.LittleEndian.Uint16(b[last : last+2]))
		msgids = append(msgids, b[last+2:last+2+ml])
		last = last + 2 + ml
	}

	return topic, msgids
}

func PackAck(acks []Ack, cmd byte) []byte {
	total := 1 + 4 + 4*len(acks)
	for _, ack := range acks {
		total += (len(ack.Msgid) + len(ack.Topic))
	}

	body := make([]byte, total)
	// command
	body[0] = cmd
	// msgs count
	binary.LittleEndian.PutUint32(body[1:5], uint32(len(acks)))
	last := 5
	for _, ack := range acks {
		ml := len(ack.Msgid)
		tl := len(ack.Topic)
		binary.LittleEndian.PutUint16(body[last:last+2], uint16(ml))
		copy(body[last+2:last+2+ml], ack.Msgid)
		binary.LittleEndian.PutUint16(body[last+2+ml:last+4+ml], uint16(tl))
		copy(body[last+4+ml:last+4+ml+tl], ack.Topic)
		last = last + 4 + ml + tl
	}

	return body
}

func UnpackAck(b []byte) []Ack {
	msl := binary.LittleEndian.Uint32(b[:4])
	acks := make([]Ack, msl)

	var last uint32 = 4
	index := 0
	bl := uint32(len(b))
	for {
		if last >= bl {
			break
		}
		ack := Ack{}

		ml := uint32(binary.LittleEndian.Uint16(b[last : last+2]))
		ack.Msgid = b[last+2 : last+2+ml]

		tl := uint32(binary.LittleEndian.Uint16(b[last+2+ml : last+4+ml]))
		ack.Topic = b[last+4+ml : last+4+ml+tl]

		acks[index] = ack

		index++
		last = last + 4 + ml + tl
	}

	return acks
}

func PackPing() []byte {
	msg := make([]byte, 5)
	binary.LittleEndian.PutUint32(msg[:4], 1)
	msg[4] = MSG_PING

	return msg
}

func PackPong() []byte {
	msg := make([]byte, 5)
	binary.LittleEndian.PutUint32(msg[:4], 1)
	msg[4] = MSG_PONG
	return msg
}

func PackConnect() []byte {
	msg := make([]byte, 5)
	binary.LittleEndian.PutUint32(msg[:4], 1)
	msg[4] = MSG_CONNECT
	return msg
}

func PackConnectOK() []byte {
	msg := make([]byte, 5)
	binary.LittleEndian.PutUint32(msg[:4], 1)
	msg[4] = MSG_CONNECT_OK

	return msg
}

func PackMsgCount(count int) []byte {
	msg := make([]byte, 1+4)
	msg[0] = MSG_COUNT
	binary.LittleEndian.PutUint32(msg[1:5], uint32(count))
	return msg
}

func UnpackMsgCount(b []byte) int {
	count := binary.LittleEndian.Uint32(b)
	return int(count)
}

func PackPullMsg(count int, msgid []byte) []byte {
	msg := make([]byte, 1+2+len(msgid))
	msg[0] = MSG_PULL
	binary.LittleEndian.PutUint16(msg[1:3], uint16(count))
	copy(msg[3:3+len(msgid)], msgid)
	return msg
}

func UnPackPullMsg(b []byte) (int, []byte) {
	count := binary.LittleEndian.Uint16(b[0:2])
	return int(count), b[2:]
}

func PackTimerMsg(m *TimerMsg, cmd byte) []byte {
	ml := uint32(len(m.ID))
	tl := uint32(len(m.Topic))
	pl := uint32(len(m.Payload))
	msg := make([]byte, 4+1+2+ml+2+tl+4+pl+8+4)

	//header
	binary.LittleEndian.PutUint32(msg[:4], 1+2+ml+2+tl+4+pl+8+4)
	//command
	msg[4] = cmd
	//msgid
	binary.LittleEndian.PutUint16(msg[5:7], uint16(ml))
	copy(msg[7:7+ml], m.ID)
	//topic
	binary.LittleEndian.PutUint16(msg[7+ml:9+ml], uint16(tl))
	copy(msg[9+ml:9+ml+tl], m.Topic)
	//payload
	binary.LittleEndian.PutUint32(msg[9+ml+tl:13+ml+tl], pl)
	copy(msg[13+ml+tl:13+ml+tl+pl], m.Payload)
	//trigger time
	binary.LittleEndian.PutUint64(msg[13+ml+tl+pl:21+ml+tl+pl], uint64(m.Trigger))
	//delay
	binary.LittleEndian.PutUint32(msg[21+ml+tl+pl:25+ml+tl+pl], uint32(m.Delay))
	return msg
}

func UnpackTimerMsg(b []byte) *TimerMsg {
	//msgid 2
	ml := uint32(binary.LittleEndian.Uint16(b[:2]))
	msgid := b[2 : 2+ml]
	//topic 2
	tl := uint32(binary.LittleEndian.Uint16(b[2+ml : 4+ml]))
	topic := b[4+ml : 4+ml+tl]
	//payload 4
	pl := binary.LittleEndian.Uint32(b[4+ml+tl : 8+ml+tl])
	payload := b[8+ml+tl : 8+ml+tl+pl]
	//trigger time 8
	st := binary.LittleEndian.Uint64(b[8+ml+tl+pl : 16+ml+tl+pl])
	//delay 4
	delay := binary.LittleEndian.Uint32(b[16+ml+tl+pl : 20+ml+tl+pl])
	return &TimerMsg{msgid, topic, payload, int64(st), int(delay)}
}

func PackPubBatch(ms []*PubMsg, cmd byte) []byte {
	bl := 19 * len(ms)
	for _, m := range ms {
		bl += (len(m.ID) + len(m.Topic) + len(m.Payload))
	}
	body := make([]byte, bl)

	last := 0
	for _, m := range ms {
		ml, tl, pl := len(m.ID), len(m.Topic), len(m.Payload)
		//msgid
		binary.LittleEndian.PutUint16(body[last:last+2], uint16(ml))
		copy(body[last+2:last+2+ml], m.ID)
		//topic
		binary.LittleEndian.PutUint16(body[last+2+ml:last+4+ml], uint16(tl))
		copy(body[last+4+ml:last+4+ml+tl], m.Topic)
		//payload
		binary.LittleEndian.PutUint32(body[last+4+ml+tl:last+8+ml+tl], uint32(pl))
		copy(body[last+8+ml+tl:last+8+ml+tl+pl], m.Payload)
		//Acked
		if m.Acked {
			body[last+8+ml+tl+pl] = '1'
		} else {
			body[last+8+ml+tl+pl] = '0'
		}
		//type
		body[last+9+ml+tl+pl] = byte(m.Type)
		//qos
		body[last+10+ml+tl+pl] = byte(m.QoS)
		// TTL
		binary.LittleEndian.PutUint64(body[last+11+ml+tl+pl:last+19+ml+tl+pl], uint64(m.TTL))
		last = last + 19 + ml + tl + pl
	}

	// 压缩body
	cbody := snappy.Encode(nil, body)

	//header
	msg := make([]byte, len(cbody)+5)
	msg[0] = cmd
	binary.LittleEndian.PutUint32(msg[1:5], uint32(len(ms)))

	copy(msg[5:], cbody)
	return msg
}

func UnpackPubBatch(m []byte) ([]*PubMsg, error) {
	msl := binary.LittleEndian.Uint32(m[:4])
	msgs := make([]*PubMsg, msl)
	// decompress
	b, err := snappy.Decode(nil, m[4:])
	if err != nil {
		return nil, err
	}
	var last uint32
	bl := uint32(len(b))
	index := 0
	for {
		if last >= bl {
			break
		}
		//msgid
		ml := uint32(binary.LittleEndian.Uint16(b[last : last+2]))
		msgid := b[last+2 : last+2+ml]
		//topic
		tl := uint32(binary.LittleEndian.Uint16(b[last+2+ml : last+4+ml]))
		topic := b[last+4+ml : last+4+ml+tl]
		//payload
		pl := binary.LittleEndian.Uint32(b[last+4+ml+tl : last+8+ml+tl])
		payload := b[last+8+ml+tl : last+8+ml+tl+pl]
		//acked
		var acked bool
		if b[last+8+ml+tl+pl] == '1' {
			acked = true
		}

		//type
		tp := b[last+9+ml+tl+pl]
		// tp, _ := binary.Uvarint(b[last+9+ml+tl+pl : last+10+ml+tl+pl])
		// qos
		qos := b[last+10+ml+tl+pl]
		// qos, _ := binary.Uvarint(b[last+10+ml+tl+pl : last+11+ml+tl+pl])
		//ttl
		ttl := binary.LittleEndian.Uint64(b[last+11+ml+tl+pl : last+19+ml+tl+pl])
		msgs[index] = &PubMsg{msgid, topic, payload, acked, int8(tp), int8(qos), int64(ttl)}

		index++
		last = last + 19 + ml + tl + pl
	}

	return msgs, nil
}

func PackReduceCount(n int) []byte {
	m := make([]byte, 1+2)
	m[0] = MSG_REDUCE_COUNT

	binary.LittleEndian.PutUint16(m[1:3], uint16(n))

	return m
}

func UnpackReduceCount(b []byte) int {
	count := binary.LittleEndian.Uint16(b[:2])

	return int(count)
}

func PackPresence(topic []byte) {
	tl := uint64(len(topic))
	m := make([]byte, 1+tl)
	m[0] = MSG_PRESENCE_ALL
	copy(m[1:1+tl], topic)
}

func UnpackPresence(b []byte) []byte {
	return b
}

func PackPresenceUsers(users [][]byte) []byte {
	ul := 1
	for _, u := range users {
		ul = ul + 1 + len(u)
	}

	m := make([]byte, ul)
	m[0] = MSG_PRESENCE_ALL

	last := 1
	for _, u := range users {
		m[last] = byte(len(u))
		copy(m[last+1:last+1+len(u)], u)
		last = last + 1 + len(u)
	}

	return m
}

func UnpackPresenceUsers(b []byte) [][]byte {
	users := make([][]byte, 0)
	last := 0
	for {
		if last >= len(b) {
			break
		}
		ul := b[last]
		user := b[last+1 : last+1+int(ul)]
		users = append(users, user)
		last = last + 1 + int(ul)
	}

	return users
}

func PackJoinChat(topic []byte) []byte {
	m := make([]byte, 1+len(topic))
	m[0] = MSG_JOIN_CHAT

	copy(m[1:], topic)
	return m
}

func UnpackJoinChat(b []byte) []byte {
	return b
}

func PackJoinChatNotify(topic []byte, user []byte) []byte {
	tl := uint16(len(topic))
	ul := uint16(len(user))
	m := make([]byte, 1+2+tl+ul)
	m[0] = MSG_JOIN_CHAT

	binary.LittleEndian.PutUint16(m[1:3], tl)
	copy(m[3:3+tl], topic)

	copy(m[3+tl:3+tl+ul], user)

	return m
}

func UnpackJoinChatNotify(b []byte) ([]byte, []byte) {
	tl := binary.LittleEndian.Uint16(b[:2])
	topic := b[2 : 2+tl]

	user := b[2+tl:]

	return topic, user
}

func PackLeaveChatNotify(topic []byte, user []byte) []byte {
	tl := uint16(len(topic))
	ul := uint16(len(user))
	m := make([]byte, 1+2+tl+ul)
	m[0] = MSG_JOIN_CHAT

	binary.LittleEndian.PutUint16(m[1:3], tl)
	copy(m[3:3+tl], topic)

	copy(m[3+tl:3+tl+ul], user)

	return m
}

func UnpackLeaveChatNotify(b []byte) ([]byte, []byte) {
	tl := binary.LittleEndian.Uint16(b[:2])
	topic := b[2 : 2+tl]

	user := b[2+tl:]

	return topic, user
}

func PackLeaveChat(topic []byte) []byte {
	m := make([]byte, 1+len(topic))
	m[0] = MSG_LEAVE_CHAT

	copy(m[1:], topic)
	return m
}

func UnpackLeaveChat(b []byte) []byte {
	return b
}
