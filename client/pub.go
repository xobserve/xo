package main

import (
	"encoding/binary"
	"fmt"
	"net"
)

func pub(conn net.Conn) {
	n := 1
	for {
		if n > 100 {
			break
		}
		// 27
		msg := make([]byte, 45)
		// 设置header
		binary.PutUvarint(msg[:4], 41)
		// 设置control flag
		msg[4] = 'a'
		// topic len
		binary.PutUvarint(msg[5:7], 7)
		// topic
		copy(msg[7:14], topic)
		// payload len
		binary.PutUvarint(msg[14:18], 16)
		// payload
		copy(msg[18:34], "1234567891234567")

		// msgid len
		binary.PutUvarint(msg[34:35], 10)

		// msgid
		msgid := fmt.Sprintf("%010d", n)
		copy(msg[35:45], msgid)
		_, err := conn.Write(msg)
		if err != nil {
			panic(err)
		}
		n++

	}
}
