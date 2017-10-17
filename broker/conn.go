package broker

import (
	"bufio"
	"fmt"
	"net"
	"sync"

	"github.com/teamsaas/meq/broker/protocol"
	"github.com/teamsaas/meq/common/logging"
	"github.com/teamsaas/meq/common/security"
	"go.uber.org/zap"
)

const MaxMessageSize int = 65536

// tcp or webSocket Conn
type Conn struct {
	sync.Mutex
	socket   net.Conn // The transport used to read and write messages.
	username string   // The username provided by the client during MQTT connect.
	luid security.ID // The locally unique id of the connection.
	guid string      // The globally unique id of the connection.
}

func (bk *Broker) NewConn(t net.Conn) *Conn {
	c := &Conn{
		socket: t,
		luid:   security.NewID(),
	}
	return c
}

// Process processes the messages.
func (c *Conn) Process() error {
	defer func() {
		if err := recover(); err != nil {
			logging.Logger.Info("conn process goroutine has a panic error", zap.Error(err.(error)))
		}
		c.Close()
	}()
	reader := bufio.NewReaderSize(c.socket, MaxMessageSize)

	for {
		// Decode an incoming MQTT packet
		msg, err := protocol.DecodePacket(reader)
		if err != nil {
			return err
		}

		switch msg.Type() {
		case protocol.TypeOfConnect:
			packet := msg.(*protocol.Connect)
			c.username = string(packet.Username)
			fmt.Println(protocol.TypeOfConnect, packet, string(packet.Username))
			ack := protocol.Connack{ReturnCode: 0x00}
			if	 _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}
		case protocol.TypeOfSubscribe:
			packet := msg.(*protocol.Subscribe)
			fmt.Println("Subscribe", packet)
			ack := protocol.Suback{
				MessageID: packet.MessageID,
				Qos:       make([]uint8, 0, len(packet.Subscriptions)),
			}
			for _, sub := range packet.Subscriptions {
				//if err := c.onSubscribe(sub.Topic); err != nil {
				//}

				// Append the QoS
				ack.Qos = append(ack.Qos, sub.Qos)
			}

			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}
		case protocol.TypeOfUnsubscribe:
			packet := msg.(*protocol.Unsubscribe)
			ack := protocol.Unsuback{MessageID: packet.MessageID}

			// Unsubscribe from each subscription
			//for _, sub := range packet.Topics {
			//	//c.onUnsubscribe(sub.Topic) // TODO: Handle error or just ignore?
			//}

			// Acknowledge the unsubscription
			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}
		case protocol.TypeOfPingreq:
			ack := protocol.Pingresp{}
			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}
		case protocol.TypeOfDisconnect:
			return nil
		case protocol.TypeOfPublish:
			return nil
		}
	}
}

func (c *Conn) Close() error {
	return c.socket.Close()
}
