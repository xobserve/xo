package main

import (
	"encoding/binary"
	"flag"
	"net"
	"time"
)

var topic = "im-test"
var host = "localhost:3908"

const (
	MSG_PUB        = 'a'
	MSG_SUB        = 'b'
	MSG_PUBACK     = 'c'
	MSG_PING       = 'd'
	MSG_PONG       = 'e'
	MSG_UNSUB      = 'f'
	MSG_COUNT      = 'g'
	MSG_PULL       = 'h'
	MSG_CONNECT    = 'i'
	MSG_CONNECT_OK = 'j'
)

var op = flag.String("op", "", "")

func main() {
	flag.Parse()

	conn, err := net.Dial("tcp", host)
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	connect(conn)
	switch *op {
	case "pub":
		pub(conn)
	case "sub":
		sub(conn)
	}
}

func connect(conn net.Conn) {
	msg := make([]byte, 5)
	binary.PutUvarint(msg[:4], 1)
	msg[4] = 'i'
	conn.Write(msg)

	_, err := conn.Read(msg)
	if err != nil {
		panic(err)
	}

	if msg[4] != MSG_CONNECT_OK {
		panic("connect failed")
	}

	go ping(conn)
}

func ping(conn net.Conn) {
	for {
		msg := make([]byte, 5)
		binary.PutUvarint(msg[:4], 1)
		msg[4] = 'd'
		conn.Write(msg)
		time.Sleep(30 * time.Second)
	}
}
