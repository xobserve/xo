package service

import (
	"encoding/binary"

	"github.com/cosmos-gg/meq/proto"
)

type Storage interface {
	Init()
	Close()

	Store(msgs []*proto.PubMsg)

	UnreadCount(topic []byte) int
	MarkRead(topic []byte, msgids [][]byte)
	UpdateUnreadCount(topic []byte, isAdd bool, count int)

	Query(topic []byte, count int, offset []byte, acked bool) []*proto.PubMsg

	StoreTM(*proto.TimerMsg)
	QueryTM() []*proto.PubMsg

	JoinChat(topic []byte, user []byte) error
	LeaveChat(topic []byte, user []byte) error
}

func PackStoreMessage(m *proto.PubMsg) []byte {
	msgid := m.ID
	payload := m.Payload

	msg := make([]byte, 2+len(msgid)+4+len(payload)+1+2+len(m.Topic)+1+1+8)
	// msgid
	binary.PutUvarint(msg[:2], uint64(len(msgid)))
	copy(msg[2:2+len(msgid)], msgid)

	// payload
	binary.PutUvarint(msg[2+len(msgid):6+len(msgid)], uint64(len(payload)))
	copy(msg[6+len(msgid):6+len(msgid)+len(payload)], payload)

	// acked
	if m.Acked {
		msg[6+len(msgid)+len(payload)] = '1'
	} else {
		msg[6+len(msgid)+len(payload)] = '0'
	}

	// topic
	binary.PutUvarint(msg[7+len(msgid)+len(payload):9+len(msgid)+len(payload)], uint64(len(m.Topic)))
	copy(msg[9+len(msgid)+len(payload):9+len(msgid)+len(payload)+len(m.Topic)], m.Topic)

	// type
	binary.PutUvarint(msg[9+len(msgid)+len(payload)+len(m.Topic):10+len(msgid)+len(payload)+len(m.Topic)], uint64(m.Type))

	// qos
	binary.PutUvarint(msg[10+len(msgid)+len(payload)+len(m.Topic):11+len(msgid)+len(payload)+len(m.Topic)], uint64(m.QoS))
	// ttl
	binary.PutVarint(msg[11+len(msgid)+len(payload)+len(m.Topic):19+len(msgid)+len(payload)+len(m.Topic)], m.TTL)
	return msg
}

func UnpackStoreMessage(b []byte) *proto.PubMsg {
	// msgid
	ml, _ := binary.Uvarint(b[:2])
	msgid := b[2 : 2+ml]

	// payload
	pl, _ := binary.Uvarint(b[2+ml : 6+ml])
	payload := b[6+ml : 6+ml+pl]

	//acked
	var acked bool
	if b[6+ml+pl] == '1' {
		acked = true
	}

	// topic
	tl, _ := binary.Uvarint(b[6+ml+pl+1 : 6+ml+pl+3])
	topic := b[6+ml+pl+3 : 6+ml+pl+3+tl]

	// type
	tp, _ := binary.Uvarint(b[6+ml+pl+3+tl : 7+ml+pl+3+tl])

	// qos
	qos, _ := binary.Uvarint(b[7+ml+pl+3+tl : 8+ml+pl+3+tl])
	//ttl
	ttl, _ := binary.Varint(b[11+ml+pl+tl : 19+ml+pl+tl])

	return &proto.PubMsg{msgid, topic, payload, acked, int8(tp), int8(qos), ttl}
}
