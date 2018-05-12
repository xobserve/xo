package network

import (
	"encoding/binary"
	"net"
	"time"
)

// the outer application send messages
func localSend(node *Node) {
	for {
		select {
		case raw := <-node.send:
			msg := encode(MSG_NORMAL, raw)
			if msg == nil {
				continue
			}
			n := 0
			if node.seedAddr != "" {
				// send to the seed
				send(msg, node.seedConn)
				n++
			}

			// send to the downstream
			node.RLock()
			for _, conn := range node.downstreams {
				send(msg, conn)
				n++
			}
			node.RUnlock()
		}
	}
}

// receive remote node's messages, and we will route to other nodes and the outer application
func routeSend(node *Node, msg []byte, cid int64) {
	if cid != node.seedID && node.seedAddr != "" {
		send(msg, node.seedConn)
	}

	node.RLock()
	for id, conn := range node.downstreams {
		if cid != id {
			nmsg := make([]byte, 4+len(msg))
			binary.PutUvarint(nmsg[:4], uint64(len(msg)))
			copy(nmsg[4:], msg)
			send(nmsg, conn)
		}
	}
	node.RUnlock()
	// send to the outer application
	node.recv <- msg[1:]
}

func encode(command byte, r []byte) []byte {
	msg := make([]byte, 4+1+len(r))
	binary.PutUvarint(msg[:4], uint64(1+len(r)))
	// fmt.Println("encode: ", msg[:4])
	msg[4] = command
	copy(msg[5:5+len(r)], r)
	return msg[:5+len(r)]
}

func send(msg []byte, conn net.Conn) {
	conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
	conn.Write(msg)
}
