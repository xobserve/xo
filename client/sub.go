package main

import (
	"encoding/binary"
	"fmt"
	"net"
)

func sub(conn net.Conn) {

	msg := make([]byte, 14)
	// 设置header
	binary.PutUvarint(msg[:4], 10)
	// 设置control flag
	msg[4] = MSG_SUB
	// topic len
	binary.PutUvarint(msg[5:7], 7)
	// topic
	copy(msg[7:14], topic)

	_, err := conn.Write(msg)
	if err != nil {
		panic(err)
	}

	for {
		header := make([]byte, 4)
		_, err := conn.Read(header)
		if err != nil {
			panic(err)
		}

		hl, _ := binary.Uvarint(header)
		msg := make([]byte, hl)
		conn.Read(msg)

		switch msg[0] {
		case MSG_PONG:

		case MSG_PUB:
			ml, _ := binary.Uvarint(msg[1:3])
			msgid := msg[3 : 3+ml]

			pl, _ := binary.Uvarint(msg[3+ml : 7+ml])
			payload := msg[7+ml : 7+ml+pl]
			acked := msg[7+ml+pl]
			fmt.Println("收到消息：", string(msgid), string(payload), string(acked))

			// 回复ack
			msg = make([]byte, 4+1+len(msgid))
			binary.PutUvarint(msg[:4], uint64(1+len(msgid)))
			msg[4] = MSG_PUBACK
			copy(msg[5:], msgid)
			conn.Write(msg)
		case MSG_COUNT:
			tl, _ := binary.Uvarint(msg[1:3])
			topic := msg[3 : 3+tl]

			count, _ := binary.Uvarint(msg[3+tl : 7+tl])
			fmt.Printf("%s当前有%d条未读消息\n", string(topic), count)

			msgid := []byte("0")
			// 拉取最新消息
			msg = make([]byte, 4+1+2+len(topic)+1+len(msgid))
			binary.PutUvarint(msg[:4], uint64(1+2+len(topic)+1+len(msgid)))
			msg[4] = MSG_PULL
			binary.PutUvarint(msg[5:7], tl)
			copy(msg[7:7+tl], topic)
			binary.PutUvarint(msg[7+tl:8+tl], 10)
			copy(msg[8+tl:8+int(tl)+len(msgid)], msgid)

			conn.Write(msg)
		}

	}
}
