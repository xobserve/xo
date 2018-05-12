package main

import (
	"encoding/binary"
	"fmt"
	"net"

	"github.com/chaingod/talent"
	"github.com/meqio/meq/proto"
)

func sub(conn net.Conn) {
	msg := proto.PackSub([]byte(topic), []byte("robot"))

	_, err := conn.Write(msg)
	if err != nil {
		panic(err)
	}

	n1 := 0
	var unread uint64
	setCount := false
	for {
		if uint64(n1) >= unread && setCount {
			break
		}
		header := make([]byte, 4)
		_, err := talent.ReadFull(conn, header, 0)
		if err != nil {
			panic(err)
		}

		hl, _ := binary.Uvarint(header)
		if hl <= 0 {
			fmt.Println("here1111:", header, hl)
			break
		}
		msg := make([]byte, hl)
		talent.ReadFull(conn, msg, 0)

		switch msg[0] {
		case proto.MSG_PONG:

		case proto.MSG_PUB:
			ms := proto.UnpackMsgs(msg[1:])
			for _, m := range ms {
				if !m.Acked {
					// 回复ack
					msg := proto.PackAck(m.ID)
					conn.Write(msg)
				}
			}
			n1 += len(ms)
			// fmt.Println("累积消费消息：", n1)
		case proto.MSG_COUNT:
			topic, count := proto.UnpackMsgCount(msg[1:])
			fmt.Printf("%s当前有%d条未读消息\n", string(topic), count)

			msgid := []byte("0")
			// 拉取最新消息
			msg := proto.PackPullMsg(msgid, topic, 0)
			conn.Write(msg)

			unread = count
			setCount = true
		}

	}

	fmt.Println("累积消费未ACK消息数：", n1)
}
