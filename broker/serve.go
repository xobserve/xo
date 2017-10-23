package broker

import (
	"github.com/teamsaas/meq/common/security"
	"github.com/teamsaas/meq/broker/subscription"
	"github.com/teamsaas/meq/common/channel"
	"fmt"
)

func (c *Conn) onSubscribe(mqttTopic []byte) error {
	// Parse the channel
	ch := channel.ParseChannel2(mqttTopic)
	if e, key := verifiedKey(ch); e == nil {
		// Subscribe the client to the channel
		ssid := subscription.NewSsid(key.Contract(), ch)
		c.Subscribe(ssid, ch.Channel)
	} else {
		return e
	}
	return nil
}

func (c *Conn) onUnsubscribe(mqttTopic []byte) *EventError {
	// Parse the channel
	ch := channel.ParseChannel2(mqttTopic)
	if e, key := verifiedKey(ch); e == nil {
		// Unsubscribe the client from the channel
		ssid := subscription.NewSsid(key.Contract(), ch)
		c.Unsubscribe(ssid, ch.Channel)
	} else {
		return e
	}
	return nil
}

func (c *Conn) onPublish(mqttTopic []byte, payload []byte) *EventError  {
	// Parse the channel
	ch := channel.ParsePublishChannel(mqttTopic)
	if e, key := verifiedKey(ch); e == nil {
		// Unsubscribe the client from the channel
		ssid := subscription.NewSsid(key.Contract(), ch)
		//TODO store mesage
		fmt.Println("ssid", ssid)
		broker.publish(ssid, ch.Channel, payload)
	} else {
		return e
	}
	return nil
}

//verified channel key
func verifiedKey(ch *channel.Channel) (*EventError, security.Key) {
	if len(ch.Channel) == 0 {
		return ErrBadRequest, nil
	}
	// Attempt to parse the key
	key, err := broker.Cipher.DecryptKey(ch.Key)
	if err != nil {
		return ErrBadRequest, nil
	}

	// Has the key expired?
	if key.IsExpired() {
		return ErrUnauthorized, nil
	}

	// Attempt to fetch the contract using the key. Underneath, it's cached.
	contract, contractFound := broker.Contract.Get(key.Contract())
	if !contractFound {
		return ErrNotFound, nil
	}

	// Validate the contract
	if !contract.Validate(key) {
		return ErrUnauthorized, nil
	}

	// Check if the key has the permission to read from here
	if !key.HasPermission(security.AllowRead) {
		return ErrUnauthorized, nil
	}

	return nil, key
}
