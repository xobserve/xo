package dotray

import (
	"encoding/binary"
	"errors"
	"fmt"
	"sync"
	"sync/atomic"

	"net"
)

// Node is the local server
type Node struct {
	nodeAddr string

	// the current seed
	seedAddr string
	seedConn net.Conn
	seedID   int64
	// the nodes which use our node as the current seed
	downstreams map[int64]net.Conn

	// outer application channels
	send chan []byte
	recv chan []byte

	sync.Mutex
}

// Seed structure
type Seed struct {
	addr  string
	retry int
}

var count int64

const (
	MSG_NORMAL = 'a'
)

/*
laddr: our node's listen addr
saddr: the source seed addr
send: outer application pushes messages to this channel
recv: outer application receives messages from this channel
*/
func StartNode(laddr, saddr string, send, recv chan []byte) error {
	if laddr == "" {
		return errors.New("please use -l to specify our node's listen addr")
	}

	node := &Node{
		nodeAddr:    laddr,
		downstreams: make(map[int64]net.Conn),
		send:        send,
		recv:        recv,
	}

	// start tcp listening
	l, err := net.Listen("tcp", laddr)
	if err != nil {
		return err
	}

	// wait for downstream nodes to connect
	go func() {
		for {
			conn, err := l.Accept()
			if err != nil {
				fmt.Println("dotray accept error:", err)
				continue
			}

			go node.receiveFrom(conn, false)
		}
	}()

	// receive outer application's message,and route to the seed node and the downstream nodes
	go localSend(node)

	// the main logic of seed manage
	if saddr != "" {
		err := node.connectSeed(saddr)
		if err != nil {
			fmt.Println("dotray dial seed error:", err)
			return err
		}

		// start to receive messages from the current seed
		node.receiveFrom(node.seedConn, true)
	} else {
		select {}
	}

	return errors.New("dotray : disconnected from seed node")
}

// receive messages from remote node
func (node *Node) receiveFrom(conn net.Conn, isSeed bool) error {
	node.Lock()
	//set connection id
	count++
	cid := count
	node.downstreams[cid] = conn
	node.Unlock()

	// close the connection
	defer func() {
		conn.Close()
		// if the node is in downstream, then remove
		if !isSeed {
			node.delete(cid)
		}
	}()

	for {
		header := make([]byte, 4)
		_, err := conn.Read(header)
		if err != nil {
			return err
		}
		bl, _ := binary.Uvarint(header)

		body := make([]byte, bl)
		_, err = conn.Read(body)
		if err != nil {
			return err
		}
		switch body[0] {
		case MSG_NORMAL:
			routeSend(node, body, cid)
		}
	}
}

// delete node from downstream
func (node *Node) delete(cid int64) {
	node.Lock()
	delete(node.downstreams, cid)
	node.Unlock()
}

// dial to remote node
func (node *Node) dialToNode(addr string) (net.Conn, error) {
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return nil, err
	}
	return conn, nil
}

// connect to the seed node
func (node *Node) connectSeed(addr string) error {
	conn, err := node.dialToNode(addr)
	if err != nil {
		return err
	}

	node.seedConn = conn
	node.seedAddr = addr
	atomic.AddInt64(&count, 1)
	node.seedID = count
	return nil
}
