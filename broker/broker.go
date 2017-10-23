package broker

import (
	"github.com/teamsaas/meq/broker/cluster"
	"github.com/teamsaas/meq/broker/subscription"
	"github.com/teamsaas/meq/common/logging"
	"github.com/teamsaas/meq/common/security"
	"github.com/teamsaas/meq/config"
	"go.uber.org/zap"
	"fmt"
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

	subscriptions *subscription.Trie
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
		Tp:      NewTcpProvider(),
		Ap:      NewAdmin(),
		Closing: make(chan bool),
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

	fmt.Println(b.Contract)

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
func (s *Broker) onPeerMessage(m *cluster.Message) {
	// Iterate through all subscribers and send them the message
	for _, subscriber := range s.subscriptions.Lookup(m.Ssid) {
		if subscriber.Type() == subscription.SubscriberDirect {

			// Send to the local subscriber
			subscriber.Send(m.Ssid, m.Channel, m.Payload)
		}
	}
}

// Occurs when a peer has a new subscription.
func (s *Broker) onSubscribe(ssid subscription.Ssid, sub subscription.Subscriber) bool {
	if _, err := s.subscriptions.Subscribe(ssid, sub); err != nil {
		return false // Unable to subscribe
	}
	logging.Logger.Info("subscribe", zap.Uint32s("ssid", ssid))
	return true
}

// Occurs when a peer has unsubscribed.
func (s *Broker) onUnsubscribe(ssid subscription.Ssid, sub subscription.Subscriber) (ok bool) {
	subscribers := s.subscriptions.Lookup(ssid)
	if ok = subscribers.Contains(sub); ok {
		s.subscriptions.Unsubscribe(ssid, sub)
	}
	logging.Logger.Info("unsubscribe", zap.Uint32s("ssid", ssid))
	return
}

// NotifySubscribe notifies the swarm when a subscription occurs.
func (s *Broker) notifySubscribe(conn *Conn, ssid subscription.Ssid, channel []byte) {

	// Notify our cluster that the client just subscribed.
	if s.cluster != nil {
		s.cluster.NotifySubscribe(conn.luid, ssid)
	}
}

// NotifyUnsubscribe notifies the swarm when an unsubscription occurs.
func (s *Broker) notifyUnsubscribe(conn *Conn, ssid subscription.Ssid, channel []byte) {

	// Notify our cluster that the client just unsubscribed.
	if s.cluster != nil {
		s.cluster.NotifyUnsubscribe(conn.luid, ssid)
	}
}
