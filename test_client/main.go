package main

import (
	"flag"
	"fmt"
	"net"
	"time"

	"github.com/chaingod/talent"
	"github.com/meqio/proto"
)

var topic = "im-test1"
var host = "localhost:"

var op = flag.String("op", "", "")
var port = flag.String("p", "", "")
var thread = flag.Int("t", 1, "")

func main() {
	flag.Parse()

	if *port == "" {
		panic("port invalid")
	}

	if *op == "test" {
		test()
		return
	}
	conns := connect()
	switch *op {
	case "pub":
		pub(conns)
	case "pub_timer":
		pubTimer(conns[0])
	case "sub":
		sub(conns[0])
	}
}

func connect() []net.Conn {
	n := 0
	var conns []net.Conn
	for {
		if n >= *thread {
			break
		}
		conn, err := net.Dial("tcp", host+*port)
		if err != nil {
			panic(err)
		}
		msg := proto.PackConnect()
		conn.Write(msg)

		_, err = talent.ReadFull(conn, msg, 0)
		if err != nil {
			panic(err)
		}

		if msg[4] != proto.MSG_CONNECT_OK {
			panic("connect failed")
		}
		go ping(conn)

		conns = append(conns, conn)
		n++
	}

	return conns
}

func ping(conn net.Conn) {
	for {
		msg := proto.PackPing()
		conn.Write(msg)
		time.Sleep(30 * time.Second)
	}
}

func test() {
	prior1 := make(chan int, 100)
	prior2 := make(chan int, 100)

	go func() {
		n := 0
		for n < 100 {
			prior1 <- n
			n++
		}
	}()
	go func() {
		n := 0
		for n < 100 {
			prior2 <- n
			n++
		}
	}()
	// 等待消息先发送完成，保证接收的时候，两个优先级队列都已经填满
	time.Sleep(100 * time.Millisecond)
	for {
		select {
		case i := <-prior1:
			fmt.Println("prior1 got:", i)
		default:
			select {
			case i := <-prior2:
				fmt.Println("prior2 got:", i)
			}
		}
	}
}
