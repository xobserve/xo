package data

/* 所有数据协议都要实现Dataer接口 */
import (
	"sync"
	"bufio"
	"net"
	"github.com/teamsaas/meq/common/logging"
	"go.uber.org/zap"
	"fmt"
)

// Conn represents an incoming connection.
type Conn struct {
	sync.Mutex
	socket   net.Conn            // The transport used to read and write messages.
	username string                 // The username provided by the client during MQTT connect.
	guid     string                 // The globally unique id of the connection.
}

func NewConn(t net.Conn)  *Conn{
	c := &Conn{
		socket:  t,
	}
	return c
}

// Process processes the messages.
func (c *Conn) Process() error {
	defer func() {
		if err := recover(); err != nil {
			logging.Logger.Info("user's main goroutine has a panic error", zap.Error(err.(error)))
		}
		c.Close()
	}()
	reader := bufio.NewReaderSize(c.socket, 65536)

	for {
		// Decode an incoming MQTT packet
		msg, err := DecodePacket(reader)
		if err != nil {
			return err
		}

		switch msg.Type() {

		// We got an attempt to connect to MQTT.
		case TypeOfConnect:
			packet := msg.(*Connect)
			c.username = string(packet.Username)
			fmt.Println(TypeOfConnect, packet, string(packet.Username))

			// Write the ack
			ack := Connack{ReturnCode: 0x00}
			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}

			// We got an attempt to subscribe to a channel.
		case TypeOfSubscribe:
			packet := msg.(*Subscribe)
			ack := Suback{
				MessageID: packet.MessageID,
				Qos:       make([]uint8, 0, len(packet.Subscriptions)),
			}

			// Subscribe for each subscription
			for _, sub := range packet.Subscriptions {
				//if err := c.onSubscribe(sub.Topic); err != nil {
				//	// TODO: Handle Error
				//}

				// Append the QoS
				ack.Qos = append(ack.Qos, sub.Qos)
			}

			// Acknowledge the subscription
			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}

			// We got an attempt to unsubscribe from a channel.
		case TypeOfUnsubscribe:
			packet := msg.(*Unsubscribe)
			ack := Unsuback{MessageID: packet.MessageID}

			// Unsubscribe from each subscription
			//for _, sub := range packet.Topics {
			//	//c.onUnsubscribe(sub.Topic) // TODO: Handle error or just ignore?
			//}

			// Acknowledge the unsubscription
			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}

			// We got an MQTT ping response, respond appropriately.
		case TypeOfPingreq:
			ack := Pingresp{}
			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}

		case TypeOfDisconnect:
			return nil

		case TypeOfPublish:
			return nil
		}
	}
}


func (c *Conn) Close() error {
	return c.socket.Close()
}