package broker

import (
	"time"
	"sync"
	"github.com/gorilla/websocket"
	"io"
	"net/http"
	"net"
)

//webSocket fun
func webSocketFunc(w http.ResponseWriter, r *http.Request)  {
	if ws, ok := TryUpgrade(w, r); ok {
		c := bk.NewConn(ws)
		go c.Process()
		return
	}
}

// websocketConn represents a websocket connection.
type websocketTransport struct {
	sync.Mutex
	socket  *websocket.Conn
	reader  io.Reader
	closing chan bool
}

const (
	writeWait        = 10 * time.Second    // Time allowed to write a message to the peer.
	pongWait         = 60 * time.Second    // Time allowed to read the next pong message from the peer.
	pingPeriod       = (pongWait * 9) / 10 // Send pings to peer with this period. Must be less than pongWait.
	closeGracePeriod = 10 * time.Second    // Time to wait before force close on connection.
)

// The default upgrader to use
var upgrader = &websocket.Upgrader{
	Subprotocols: []string{"mqttv3.1", "mqttv3", "mqttv3"},
	CheckOrigin:  func(r *http.Request) bool { return true },
}

// TryUpgrade attempts to upgrade an HTTP request to mqtt over websocket.
func TryUpgrade(w http.ResponseWriter, r *http.Request) (net.Conn, bool) {
	if w == nil || r == nil {
		return nil, false
	}

	if ws, err := upgrader.Upgrade(w, r, nil); err == nil {
		return newConn(ws), true
	}

	return nil, false
}

// newConn creates a new transport from websocket.
func newConn(ws *websocket.Conn) net.Conn {
	conn := &websocketTransport{
		socket:  ws,
		closing: make(chan bool),
	}

	return conn
}

// Read reads data from the connection. It is possible to allow reader to time
// out and return a Error with Timeout() == true after a fixed time limit by
// using SetDeadline and SetReadDeadline on the websocket.
func (c *websocketTransport) Read(b []byte) (n int, err error) {
	var opCode int
	if c.reader == nil {
		// New message
		var r io.Reader
		for {
			if opCode, r, err = c.socket.NextReader(); err != nil {
				return
			}

			if opCode != websocket.BinaryMessage && opCode != websocket.TextMessage {
				continue
			}

			c.reader = r
			break
		}
	}

	// Read from the reader
	n, err = c.reader.Read(b)
	if err != nil {
		if err == io.EOF {
			c.reader = nil
			err = nil
		}
	}
	return
}

// Write writes data to the connection. It is possible to allow writer to time
// out and return a Error with Timeout() == true after a fixed time limit by
// using SetDeadline and SetWriteDeadline on the websocket.
func (c *websocketTransport) Write(b []byte) (n int, err error) {
	// Serialize write to avoid concurrent write
	c.Lock()
	defer c.Unlock()

	var w io.WriteCloser
	if w, err = c.socket.NextWriter(websocket.BinaryMessage); err != nil {
		return
	}
	if n, err = w.Write(b); err != nil {
		return
	}
	err = w.Close()
	return
}

// Close terminates the connection.
func (c *websocketTransport) Close() error {
	return c.socket.Close()
}

// LocalAddr returns the local network address.
func (c *websocketTransport) LocalAddr() net.Addr {
	return c.socket.LocalAddr()
}

// RemoteAddr returns the remote network address.
func (c *websocketTransport) RemoteAddr() net.Addr {
	return c.socket.RemoteAddr()
}

// SetDeadline sets the read and write deadlines associated
// with the connection. It is equivalent to calling both
// SetReadDeadline and SetWriteDeadline.
func (c *websocketTransport) SetDeadline(t time.Time) error {
	if err := c.socket.SetReadDeadline(t); err != nil {
		return err
	}

	return c.socket.SetWriteDeadline(t)
}

// SetReadDeadline sets the deadline for future Read calls
// and any currently-blocked Read call.
func (c *websocketTransport) SetReadDeadline(t time.Time) error {
	return c.socket.SetReadDeadline(t)
}

// SetWriteDeadline sets the deadline for future Write calls
// and any currently-blocked Write call.
func (c *websocketTransport) SetWriteDeadline(t time.Time) error {
	return c.socket.SetWriteDeadline(t)
}
