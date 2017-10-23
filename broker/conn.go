package broker

import (
	"bufio"
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
	socket    net.Conn               // The transport used to read and write messages.
	username  string                 // The username provided by the client during MQTT connect.
	luid      security.ID            // The locally unique id
	guid      string                 // The cluster unique id
	subs      *subscription.Counters // The subscriptions for this connection.
	messageId uint16
}

func (b *Broker) NewConn(t net.Conn) *Conn {
	c := &Conn{
		socket: t,
		luid:   security.NewID(),
		subs:   subscription.NewCounters(),
	}
	c.guid = c.luid.Unique(uint64(address.Hardware()), "emitter")
	logging.Logger.Info("conn created", zap.String("guid",c.guid))
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
			ack := protocol.Connack{ReturnCode: 0x00}
			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}
		case protocol.TypeOfSubscribe:
			packet := msg.(*protocol.Subscribe)
			ack := protocol.Suback{
				MessageID: packet.MessageID,
				Qos:       make([]uint8, 0, len(packet.Subscriptions)),
			}
			for _, sub := range packet.Subscriptions {
				if err := c.onSubscribe(sub.Topic); err != nil {
				}
				ack.Qos = append(ack.Qos, sub.Qos)
			}

			if _, err := ack.EncodeTo(c.socket); err != nil {
				return err
			}
		case protocol.TypeOfUnsubscribe:
			packet := msg.(*protocol.Unsubscribe)
			ack := protocol.Unsuback{MessageID: packet.MessageID}

			 //Unsubscribe from each subscription
			for _, sub := range packet.Topics {
				c.onUnsubscribe(sub.Topic)
			}

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
			packet := msg.(*protocol.Publish)

			if err := c.onPublish(packet.Topic, packet.Payload); err != nil {
				logging.Logger.Error("onPublish error", zap.String("Topic", string(packet.Topic)))
			}

			// Acknowledge the publication
			if packet.Header.QOS > 0 {
				ack := protocol.Puback{MessageID: packet.MessageID}
				if _, err := ack.EncodeTo(c.socket); err != nil {
					return err
				}
			}
		}
	}
}

// Subscribe subscribes to a particular channel.
func (c *Conn) Subscribe(ssid subscription.Ssid, channel []byte) {
	// Add the subscription
	if first := c.subs.Increment(ssid, channel); first {
		// subscribe to trie
		broker.onSubscribe(ssid, c)

		// Broadcast the subscription within our cluster
		broker.notifySubscribe(c, ssid, channel)
	}
}

// Unsubscribe unsubscribes this client from a particular channel.
func (c *Conn)Unsubscribe(ssid subscription.Ssid, channel []byte) {
	// Decrement the counter and if there's no more subscriptions, notify everyone.
	if last := c.subs.Decrement(ssid); last {
		// Unsubscribe the subscriber
		broker.onUnsubscribe(ssid, c)

		// Broadcast the unsubscription within our cluster
		broker.notifyUnsubscribe(c, ssid, channel)
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
	packet := protocol.Publish{
		Header: &protocol.StaticHeader{
			QOS: 0,
		},
		MessageID: c.messageId,
		Topic:     channel, // The channel for this message.
		Payload:   payload, // The payload for this message.
	}

	// Acknowledge the publication
	_, err := packet.EncodeTo(c.socket)
	c.messageId++
	if err != nil {
		logging.Logger.Error("message send", zap.Error(err))
		return err
	}

	return nil
}

func (c *Conn) Close() error {
	for _, counter := range c.subs.All() {
		broker.onUnsubscribe(counter.Ssid, c)
		broker.notifyUnsubscribe(c, counter.Ssid, counter.Channel)
	}
	return c.socket.Close()
}
