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
	"github.com/teamsaas/meq/common/address"
	"github.com/teamsaas/meq/broker/subscription"
)

const MaxMessageSize int = 65536

// tcp or webSocket Conn
type Conn struct {
	sync.Mutex
	socket   net.Conn               // The transport used to read and write messages.
	username string                 // The username provided by the client during MQTT connect.
	luid     security.ID            // The locally unique id
	guid     string                 // The cluster unique id
	subs     *subscription.Counters // The subscriptions for this connection.
}

func (b *Broker) NewConn(t net.Conn) *Conn {
	c := &Conn{
		socket: t,
		luid:   security.NewID(),
	}
	c.guid = c.luid.Unique(uint64(address.Hardware()), "emitter")
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
			if _, err := ack.EncodeTo(c.socket); err != nil {
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
				if err := c.onSubscribe(sub.Topic); err != nil {
				}

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

func (c *Conn) Subscribe(ssid subscription.Ssid, channel []byte) {
	c.Lock()
	defer c.Unlock()

	// Add the subscription
	if first := c.subs.Increment(ssid, channel); first {
		// subscribe to trie
		broker.onSubscribe(ssid, c)

		// Broadcast the subscription within our cluster
		broker.notifySubscribe(c, ssid, channel)
	}

}


// ID returns the unique identifier of the subsriber.
func (c *Conn) ID() string {
	return c.guid
}

// Type returns the type of the subscriber
func (c *Conn) Type() subscription.SubscriberType {
	return subscription.SubscriberDirect
}

func (c *Conn) Send(ssid subscription.Ssid, channel []byte, payload []byte) error {
	return nil
}

func (c *Conn) Close() error {
	return c.socket.Close()
}
