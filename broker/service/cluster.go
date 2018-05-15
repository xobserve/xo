package service

import (
	"bytes"
	"encoding/gob"
	"io/ioutil"
	"log"
	"net"
	"os"
	"sort"
	"strconv"
	"strings"

	"github.com/weaveworks/mesh"
	"go.uber.org/zap"
)

type cluster struct {
	bk     *Broker
	closed chan struct{}
	peer   *peer
}

func (c *cluster) Init() {
	c.closed = make(chan struct{})
	peers := stringset{}
	hwaddr := Conf.Cluster.HwAddr
	meshListen := net.JoinHostPort("0.0.0.0", Conf.Cluster.Port)
	channel := "default"
	nickname := mustHostname()

	for _, peer := range Conf.Cluster.SeedPeers {
		peers[peer] = struct{}{}
	}

	host, portStr, err := net.SplitHostPort(meshListen)
	if err != nil {
		L.Fatal("cluster address invalid", zap.Error(err), zap.String("listen_addr", meshListen))
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		L.Fatal("cluter port invalid", zap.Error(err), zap.String("listen_port", portStr))
	}

	name, err := mesh.PeerNameFromString(hwaddr)
	if err != nil {
		L.Fatal("hardware addr invalid", zap.Error(err), zap.String("hardware_addr", hwaddr))
	}

	router, err := mesh.NewRouter(mesh.Config{
		Host:               host,
		Port:               port,
		ProtocolMinVersion: mesh.ProtocolMinVersion,
		ConnLimit:          64,
		PeerDiscovery:      true,
		TrustedSubnets:     []*net.IPNet{},
	}, name, nickname, mesh.NullOverlay{}, log.New(ioutil.Discard, "", 0))

	if err != nil {
		L.Fatal("Could not create cluster", zap.Error(err))
	}

	peer := newPeer(name, c.bk)
	gossip, err := router.NewGossip(channel, peer)
	if err != nil {
		L.Fatal("Could not create cluster gossip", zap.Error(err))
	}
	peer.register(gossip)
	c.peer = peer

	func() {
		L.Debug("cluster starting", zap.String("listen_addr", meshListen))
		router.Start()
	}()
	defer func() {
		L.Debug("cluster stopping", zap.String("listen_addr", meshListen))
		router.Stop()
	}()

	router.ConnectionMaker.InitiateConnections(peers.slice(), true)

	select {
	case <-c.closed:

	}
}

func (c *cluster) Close() {
	c.closed <- struct{}{}
}

// Peer encapsulates state and implements mesh.Gossiper.
// It should be passed to mesh.Router.NewGossip,
// and the resulting Gossip registered in turn,
// before calling mesh.Router.Start.
type peer struct {
	name    mesh.PeerName
	bk      *Broker
	send    mesh.Gossip
	actions chan<- func()
	quit    chan struct{}
}

// peer implements mesh.Gossiper.
var _ mesh.Gossiper = &peer{}

// Construct a peer with empty state.
// Be sure to register a channel, later,
// so we can make outbound communication.
func newPeer(pn mesh.PeerName, b *Broker) *peer {
	p := &peer{
		name: pn,
		bk:   b,
		send: nil, // must .register() later
	}
	return p
}

// register the result of a mesh.Router.NewGossip.
func (p *peer) register(send mesh.Gossip) {
	p.send = send
}

func (p *peer) stop() {

}

// Return a copy of our complete state.
func (p *peer) Gossip() mesh.GossipData {
	return p.bk.subs
}

// Merge the gossiped data represented by buf into our state.
// Return the state information that was modified.
func (p *peer) OnGossip(buf []byte) (delta mesh.GossipData, err error) {
	var set Subs
	err = gob.NewDecoder(bytes.NewReader(buf)).Decode(&set)
	if err != nil {
		L.Info("on gossip decode error", zap.Error(err))
		return
	}

	p.bk.subs.Merge(set)
	return
}

// Merge the gossiped data represented by buf into our state.
// Return the state information that was modified.
func (p *peer) OnGossipBroadcast(src mesh.PeerName, buf []byte) (received mesh.GossipData, err error) {
	var msg SubMessage
	err = gob.NewDecoder(bytes.NewReader(buf)).Decode(&msg)
	if err != nil {
		L.Info("on gossip broadcast decode error", zap.Error(err))
		return
	}

	switch msg.TP {
	case CLUSTER_SUB:
		p.bk.store.Sub(msg.Topic, msg.Group, msg.Cid, src)
	case CLUSTER_UNSUB:
		p.bk.store.Unsub(msg.Topic, msg.Group, msg.Cid, src)
	}

	return
}

// Merge the gossiped data represented by buf into our state.
func (p *peer) OnGossipUnicast(src mesh.PeerName, buf []byte) error {
	p.bk.router.recvRoute(buf)
	return nil
}

type stringset map[string]struct{}

func (ss stringset) Set(value string) error {
	ss[value] = struct{}{}
	return nil
}

func (ss stringset) String() string {
	return strings.Join(ss.slice(), ",")
}

func (ss stringset) slice() []string {
	slice := make([]string, 0, len(ss))
	for k := range ss {
		slice = append(slice, k)
	}
	sort.Strings(slice)
	return slice
}

func mustHardwareAddr() string {
	ifaces, err := net.Interfaces()
	if err != nil {
		panic(err)
	}
	for _, iface := range ifaces {
		if s := iface.HardwareAddr.String(); s != "" {
			return s
		}
	}
	panic("no valid network interfaces")
}

func mustHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}
	return hostname
}
