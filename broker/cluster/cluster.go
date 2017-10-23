package cluster

import (
	"bytes"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"github.com/golang/snappy"
	"github.com/teamsaas/meq/common/address"
	"github.com/teamsaas/meq/common/security"
	"github.com/teamsaas/tools"
	"go.uber.org/zap"

	"github.com/teamsaas/meq/broker/subscription"
	"github.com/teamsaas/meq/common/encode"
	"github.com/teamsaas/meq/common/logging"
	"github.com/teamsaas/meq/config"
	"github.com/weaveworks/mesh"
)

// Cluster represents a gossiper.
type Cluster struct {
	sync.Mutex
	name    mesh.PeerName      // The name of ourselves.
	actions chan func()        // The action queue for the peer.
	closing chan bool          // The closing channel.
	state   *subscriptionState // The state to synchronise.
	router  *mesh.Router       // The mesh router.
	gossip  mesh.Gossip        // The gossip protocol.
	members *sync.Map          // The map of members in the peer set.

	OnSubscribe   func(subscription.Ssid, subscription.Subscriber) bool // Delegate to invoke when the subscription event is received.
	OnUnsubscribe func(subscription.Ssid, subscription.Subscriber) bool // Delegate to invoke when the subscription event is received.
	OnMessage     func(*Message)                                        // Delegate to invoke when a new message is received.
}

// Cluster implements mesh.Gossiper.
var _ mesh.Gossiper = &Cluster{}

// NewCluster creates a new Cluster messaging layer.
func NewCluster(closing chan bool) *Cluster {
	cluster := &Cluster{
		name:    getLocalPeerName(),
		actions: make(chan func()),
		closing: closing,
		state:   newSubscriptionState(),
		members: new(sync.Map),
	}

	// Get the cluster binding address
	listenAddr, err := parseAddr(config.Conf.Broker.Cluster.ListenAddr)
	if err != nil {
		panic(err)
	}

	// Get the advertised address
	advertiseAddr, err := parseAddr(config.Conf.Broker.Cluster.AdvertiseAddr)
	if err != nil {
		panic(err)
	}

	// Create a new router
	router, err := mesh.NewRouter(mesh.Config{
		Host:               listenAddr.IP.String(),
		Port:               listenAddr.Port,
		ProtocolMinVersion: mesh.ProtocolMinVersion,
		Password:           []byte(config.Conf.Broker.Cluster.Passphrase),
		ConnLimit:          128,
		PeerDiscovery:      true,
		TrustedSubnets:     []*net.IPNet{},
	}, cluster.name, advertiseAddr.String(), mesh.NullOverlay{}, logging.Discard)
	if err != nil {
		panic(err)
	}

	// Create a new gossip layer
	gossip, err := router.NewGossip("cluster", cluster)
	if err != nil {
		panic(err)
	}

	//Store the gossip and the router
	cluster.gossip = gossip
	cluster.router = router
	return cluster
}

// Occurs when a peer is garbage collected.
func (s *Cluster) onPeerOffline(name mesh.PeerName) {
	if v, ok := s.members.Load(name); ok {
		peer := v.(*Peer)
		logging.Logger.Info("Cluster peer removed", zap.String("peer_name", peer.name.String()))
		peer.Close() // Close the peer on our end

		// We also need to remove the peer from our set, so next time a new peer can be created.
		s.members.Delete(peer.name)

		// Unsubscribe from all active subscriptions
		for _, c := range peer.subs.All() {
			s.OnUnsubscribe(c.Ssid, peer)
		}
	}
}

// FindPeer retrieves a peer.
func (s *Cluster) FindPeer(name mesh.PeerName) *Peer {
	if p, ok := s.members.Load(name); ok {
		return p.(*Peer)
	}

	// Create new peer and store it
	peer := s.newPeer(name)
	v, ok := s.members.LoadOrStore(name, peer)
	if !ok {
		logging.Logger.Info("Cluster peer created", zap.String("peer_name", peer.name.String()))
	}
	return v.(*Peer)
}

// ID returns the local node ID.
func (s *Cluster) ID() uint64 {
	return uint64(s.name)
}

// Listen creates the listener and serves the cluster.
func (s *Cluster) Listen() {

	// Every few seconds, attempt to reinforce our cluster structure by
	// initiating connections with all of our peers.
	tools.Repeat(s.update, 5*time.Second, s.closing)

	// Start the router
	s.router.Start()
}

// update attempt to update our cluster structure by initiating connections
// with all of our peers. This is is called periodically.
func (s *Cluster) update() {
	desc := s.router.Peers.Descriptions()
	for _, peer := range desc {
		if !peer.Self {
			// Mark the peer as active, so even if there's no messages being exchanged
			// we still keep the peer, since we know that the peer is live.
			s.FindPeer(peer.Name).touch()

			// reinforce structure
			if peer.NumConnections < (len(desc) - 1) {
				s.Join(peer.NickName)
			}
		}
	}

	// Mark a peer as offline
	s.members.Range(func(k, v interface{}) bool {
		if p, ok := v.(*Peer); ok && !p.IsActive() {
			fmt.Println("node offline:", p.name)
			s.onPeerOffline(p.name)
		}
		return true
	})
}

// Join attempts to join a set of existing peers.
func (s *Cluster) Join(peers ...string) []error {
	return s.router.ConnectionMaker.InitiateConnections(peers, false)
}

// Merge merges the incoming state and returns a delta
func (s *Cluster) merge(buf []byte) (mesh.GossipData, error) {

	// Decode the state we just received
	other, err := decodeSubscriptionState(buf)
	if err != nil {
		return nil, err
	}

	// Merge and get the delta
	delta := s.state.Merge(other)
	for k, v := range other.All() {

		// Decode the event
		ev, err := decodeSubscriptionEvent(k.(string))
		if err != nil {
			return nil, err
		}

		// Get the peer to use
		peer := s.FindPeer(ev.Peer)

		// If the subscription is added, notify (TODO: use channels)
		if v.IsAdded() && peer.onSubscribe(k.(string), ev.Ssid) {
			s.OnSubscribe(ev.Ssid, peer)
		}

		// If the subscription is removed, notify (TODO: use channels)
		if v.IsRemoved() && peer.onUnsubscribe(k.(string), ev.Ssid) {
			s.OnUnsubscribe(ev.Ssid, peer)
		}
	}

	return delta, nil
}

// NumPeers returns the number of connected peers.
func (s *Cluster) NumPeers() int {
	for _, peer := range s.router.Peers.Descriptions() {
		if peer.Self {
			return peer.NumConnections
		}
	}
	return 0
}

// Gossip returns the state of everything we know; gets called periodically.
func (s *Cluster) Gossip() (complete mesh.GossipData) {
	fmt.Println("Gossip")
	return s.state
}

// OnGossip merges received data into state and returns "everything new I've just
// learnt", or nil if nothing in the received data was new.
func (s *Cluster) OnGossip(buf []byte) (delta mesh.GossipData, err error) {
	fmt.Println("OnGossip", string(buf))
	if len(buf) <= 1 {
		return nil, nil
	}

	if delta, err = s.merge(buf); err != nil {
		logging.Logger.Info("merge error", zap.Error(err))
	}
	return
}

// OnGossipBroadcast merges received data into state and returns a representation
// of the received data (typically a delta) for further propagation.
func (s *Cluster) OnGossipBroadcast(src mesh.PeerName, buf []byte) (delta mesh.GossipData, err error) {
	if delta, err = s.merge(buf); err != nil {
		logging.Logger.Info("merge error", zap.Error(err))
	}
	return
}

// OnGossipUnicast occurs when the gossip unicast is received. In emitter this is
// used only to forward message frames around.
func (s *Cluster) OnGossipUnicast(src mesh.PeerName, buf []byte) error {

	// Make a reader and a decoder for the frame
	snappy := snappy.NewReader(bytes.NewReader(buf))
	reader := encode.NewDecoder(snappy)

	// Decode an incoming message frame
	frame, err := decodeMessageFrame(reader)
	if err != nil {
		logging.Logger.Info("cluster decode frame", zap.Error(err))
		return err
	}

	// Go through each message in the decoded frame
	for _, m := range frame {
		s.OnMessage(m)
	}

	return nil
}

// NotifySubscribe notifies the Cluster when a subscription occurs.
func (s *Cluster) NotifySubscribe(conn security.ID, ssid subscription.Ssid) {
	event := SubscriptionEvent{
		Peer: s.name,
		Conn: conn,
		Ssid: ssid,
	}

	// Add to our global state
	s.state.Add(event.Encode())
	// Create a delta for broadcasting just this operation
	op := newSubscriptionState()
	op.Add(event.Encode())
	s.gossip.GossipBroadcast(op)
}

// NotifyUnsubscribe notifies the Cluster when an unsubscription occurs.
func (s *Cluster) NotifyUnsubscribe(conn security.ID, ssid subscription.Ssid) {
	event := SubscriptionEvent{
		Peer: s.name,
		Conn: conn,
		Ssid: ssid,
	}

	// Remove from our global state
	s.state.Remove(event.Encode())

	// Create a delta for broadcasting just this operation
	op := newSubscriptionState()
	op.Remove(event.Encode())
	s.gossip.GossipBroadcast(op)
}

// Close terminates the connection.
func (s *Cluster) Close() error {
	return s.router.Stop()
}

// parseAddr parses a TCP address.
func parseAddr(text string) (*net.TCPAddr, error) {
	if text[0] == ':' {
		text = "0.0.0.0" + text
	}

	addr := strings.Replace(text, "public", address.External().String(), 1)
	return net.ResolveTCPAddr("tcp", addr)
}

// getLocalPeerName retrieves or generates a local node name. a
func getLocalPeerName() mesh.PeerName {
	peerName := mesh.PeerName(address.Hardware())
	if config.Conf.Broker.Cluster.NodeName != "" {
		if name, err := mesh.PeerNameFromString(config.Conf.Broker.Cluster.NodeName); err != nil {
			logging.Logger.Fatal("cluster getting node name error", zap.Error(err))
		} else {
			peerName = name
		}
	}
	return peerName
}
