package broker

import (
	"github.com/teamsaas/meq/common/security"
	"github.com/teamsaas/meq/broker/subscription"
	"github.com/teamsaas/meq/common/channel"
)

func (c *Conn) onSubscribe(mqttTopic []byte) error {
	ch := channel.ParseChannel(mqttTopic)

	if ch.ChannelType == channel.ChannelInvalid{
		return ErrBadRequest
	}

	// Attempt to parse the key
	key, err := broker.Cipher.DecryptKey(ch.Key)
	if err != nil {
		return ErrBadRequest
	}

	if key.IsExpired() {
		return ErrUnauthorized
	}

	// Attempt to fetch the contract using the key. Underneath, it's cached.
	contract, contractFound := broker.Contract.Get(key.Contract())
	if !contractFound {
		return ErrNotFound
	}

	// Validate the contract
	if !contract.Validate(key) {
		return ErrUnauthorized
	}

	// Check if the key has the permission to read from here
	if !key.HasPermission(security.AllowRead) {
		return ErrUnauthorized
	}

	// Check if the key has the permission for the required channel
	if key.Target() != 0 && key.Target() != ch.Target() {
		return ErrUnauthorized
	}
	// Subscribe the client to the channel
	ssid := subscription.NewSsid(key.Contract(), ch)
	c.Subscribe(ssid, ch.Channel)
}
