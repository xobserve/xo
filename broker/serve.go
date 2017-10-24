package broker

import (
	"github.com/teamsaas/meq/common/security"
	"github.com/teamsaas/meq/broker/subscription"
	"github.com/teamsaas/meq/common/channel"
	"fmt"
	"github.com/teamsaas/tools"
	"github.com/teamsaas/meq/common/logging"
	"go.uber.org/zap"
)

func (c *Conn) onSubscribe(mqttTopic []byte) error {
	fmt.Println("mqttTopic", string(mqttTopic))
	// Parse the channel
	ch := channel.ParseChannel(mqttTopic)
	if e, key := verifiedKey(ch); e == nil {
		// Subscribe the client to the channel
		ch.AppnedUserChannel(tools.String2Bytes(c.username))
		fmt.Println(ch.Query, string(ch.Channel), ch.Type)
		ssid := subscription.NewSsid(key.Contract(), ch)
		c.Subscribe(ssid, ch.Channel)
	} else {
		return e
	}
	return nil
}

func (c *Conn) onUnsubscribe(mqttTopic []byte) *EventError {
	// Parse the channel
	ch := channel.ParseChannel(mqttTopic)
	if e, key := verifiedKey(ch); e == nil {
		// Unsubscribe the client from the channel
		ch.AppnedUserChannel(tools.String2Bytes(c.username))
		ssid := subscription.NewSsid(key.Contract(), ch)
		c.Unsubscribe(ssid, ch.Channel)
	} else {
		return e
	}
	return nil
}

func (c *Conn) onPublish(mqttTopic []byte, payload []byte) *EventError {
	// Parse the channel
	ch := channel.ParsePublishChannel(mqttTopic)
	if e, key := verifiedKey(ch); e == nil {
		// Unsubscribe the client from the channel
		ssid := subscription.NewSsid(key.Contract(), ch)
		//TODO store mesage
		fmt.Println("ssid", ssid,string(ch.Channel))
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
	fmt.Println("channelMap", broker.ChannelMap)
	ok, e := broker.ChannelMap.Exist(tools.Bytes2String(ch.Channel))
	if !ok || e != nil {
		logging.Logger.Info("channel exist error", zap.Error(e))
		return ErrPaymentRequired, nil
	}

	return nil, key
}

