package broker

import (
	"github.com/teamsaas/meq/broker/cluster"
	"github.com/teamsaas/meq/broker/subscription"
	"github.com/teamsaas/meq/common/logging"
	"github.com/teamsaas/meq/common/security"
	"github.com/teamsaas/meq/config"
	"go.uber.org/zap"
	"fmt"
	"github.com/teamsaas/meq/broker/storage"
)

type Broker struct {
	Tp *TcpProvider
	Hp *HttpProvider

	Ap *Admin

	License  *security.License
	Cipher   *security.Cipher
	Contract *security.SingleContractProvider

	cluster *cluster.Cluster
	Closing chan bool

	Smap *subscription.Smap

	Mysql      *storage.Mysql
	ChannelMap storage.ChannelMap
}

func Start(conf string) {
	config.InitConfig(conf)
	logging.InitLogger(config.Conf.Common.LogPath, config.Conf.Common.LogLevel, config.Conf.Common.IsDebug, config.Conf.Common.Service)

	// check license exists
	if config.Conf.Broker.License == "" {
		logging.Logger.Warn("Please generate license first by calling 'meq gen',then update meq.yaml's broker.license with your license ")
		return
	}

	b := &Broker{
		Tp:         NewTcpProvider(),
		Ap:         NewAdmin(),
		Closing:    make(chan bool),
		Smap:       subscription.NewSmap(),
		Mysql:      storage.NewMysql(config.Conf.Broker.Mysql.Addr, config.Conf.Broker.Mysql.Acc, config.Conf.Broker.Mysql.Pw, config.Conf.Broker.Mysql.Port, config.Conf.Broker.Mysql.Database),
		ChannelMap: storage.NewChannelMap(),
	}

	var err error
	if b.License, err = security.ParseLicense(config.Conf.Broker.License); err != nil {
		logging.Logger.Warn("license parse error: ", zap.Error(err))
		return
	}

	// Create a new cipher from the licence provided
	if b.Cipher, err = b.License.Cipher(); err != nil {
		logging.Logger.Warn("Cipher generate error: ", zap.Error(err))
		return
	}

	b.Contract =
		security.NewSingleContractProvider(b.License)

	b.Mysql.Start()

	// start the cluster
	// Create a new cluster if we have this configured
	b.cluster = cluster.NewCluster(b.Closing)
	b.cluster.OnMessage = b.onPeerMessage
	b.cluster.OnSubscribe = b.onSubscribe
	b.cluster.OnUnsubscribe = b.onUnsubscribe

	if b.cluster.Listen(); err != nil {
		panic(err)
	}

	// Join our seed
	b.cluster.Join(config.Conf.Broker.Cluster.SeedAddr)

	broker = b

	go b.Tp.Start()
	go b.Hp.Start()

	// start admin api
	b.Ap.Start()
}

// Occurs when a message is received from a peer.
func (b *Broker) onPeerMessage(m *cluster.Message) {
	// Iterate through all subscribers and send them the message
	for _, subscriber := range b.Smap.Lookup(m.Ssid) {
		if subscriber.Type() == subscription.SubscriberDirect {

			// Send to the local subscriber
			subscriber.Send(m.Ssid, m.Channel, m.Payload)
		}
	}
}

// Publish publishes a message to everyone and returns the number of outgoing bytes written.
func (b *Broker) publish(ssid subscription.Ssid, channel, payload []byte) {
	for _, subscriber := range b.Smap.Lookup(ssid) {
		fmt.Println("Lookup", subscriber.ID())
		subscriber.Send(ssid, channel, payload)
	}
}

// Occurs when a peer has a new subscription.
func (b *Broker) onSubscribe(ssid subscription.Ssid, sub subscription.Subscriber) bool {
	if _, err := b.Smap.Subscribe(ssid, sub); err != nil {
		return false // Unable to subscribe
	}
	logging.Logger.Info("subscribe", zap.Uint32s("ssid", ssid))
	return true
}

// Occurs when a peer has unsubscribed.
func (b *Broker) onUnsubscribe(ssid subscription.Ssid, sub subscription.Subscriber) (ok bool) {
	b.Smap.Unsubscribe(ssid, sub)
	logging.Logger.Info("unsubscribe", zap.Uint32s("ssid", ssid))
	return
}

// NotifySubscribe notifies the swarm when a subscription occurs.
func (b *Broker) notifySubscribe(conn *Conn, ssid subscription.Ssid, channel []byte) {

	// Notify our cluster that the client just subscribed.
	if b.cluster != nil {
		b.cluster.NotifySubscribe(conn.luid, ssid)
	}
}

// NotifyUnsubscribe notifies the swarm when an unsubscription occurs.
func (b *Broker) notifyUnsubscribe(conn *Conn, ssid subscription.Ssid, channel []byte) {

	// Notify our cluster that the client just unsubscribed.
	if b.cluster != nil {
		b.cluster.NotifyUnsubscribe(conn.luid, ssid)
	}
}
