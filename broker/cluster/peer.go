package cluster

import (
	"bytes"
	"sync"
	"sync/atomic"
	"time"

	"github.com/emitter-io/emitter/broker/subscription"
	"github.com/emitter-io/emitter/encoding"
	"github.com/emitter-io/emitter/logging"
	"github.com/emitter-io/emitter/utils"
	"github.com/golang/snappy"
	"github.com/weaveworks/mesh"
)

// Peer implements subscription.Subscriber
var _ subscription.Subscriber = &Peer{}

// Peer represents a remote peer.
type Peer struct {
	sync.Mutex
	sender   mesh.Gossip            // The gossip interface to use for sending.
	name     mesh.PeerName          // The peer name for communicating.
	frame    MessageFrame           // The current message frame.
	subs     *subscription.Counters // The SSIDs of active subscriptions for this peer.
	activity int64                  // The time of last activity of the peer.
	closing  chan bool              // The closing channel for the peer.
}

// NewPeer creates a new peer for the connection.
func (s *Cluster) newPeer(name mesh.PeerName) *Peer {
	peer := &Peer{
		sender:   s.gossip,
		name:     name,
		frame:    make(MessageFrame, 0, 64),
		subs:     subscription.NewCounters(),
		activity: time.Now().Unix(),
		closing:  make(chan bool),
	}

	// Spawn the send queue processor
	utils.Repeat(peer.processSendQueue, 5*time.Millisecond, peer.closing)
	return peer
}

// Occurs when the peer is subscribed
func (p *Peer) onSubscribe(encodedEvent string, ssid subscription.Ssid) bool {
	return p.subs.Increment(ssid, []byte(encodedEvent))
}

// Occurs when the peer is unsubscribed
func (p *Peer) onUnsubscribe(encodedEvent string, ssid subscription.Ssid) bool {
	return p.subs.Decrement(ssid)
}

// Close termintes the peer and stops everything associated with this peer.
func (p *Peer) Close() {
	p.Lock()
	defer p.Unlock()

	close(p.closing)
}

// ID returns the unique identifier of the subsriber.
func (p *Peer) ID() string {
	return p.name.String()
}

// Type returns the type of the subscriber.
func (p *Peer) Type() subscription.SubscriberType {
	return subscription.SubscriberRemote
}

// IsActive checks whether a peer is still active or not.
func (p *Peer) IsActive() bool {
	return (atomic.LoadInt64(&p.activity) + 30) > time.Now().Unix()
}

// Send forwards the message to the remote server.
func (p *Peer) Send(ssid subscription.Ssid, channel []byte, payload []byte) error {
	p.Lock()
	defer p.Unlock()

	// TODO: Make sure we don't send to a dead peer
	if p.IsActive() {

		// Send simply appends the message to a frame
		p.frame = append(p.frame, &Message{Ssid: ssid, Channel: channel, Payload: payload})
	}

	return nil
}

// Touch updates the activity time of the peer.
func (p *Peer) touch() {
	atomic.StoreInt64(&p.activity, time.Now().Unix())
}

// processSendQueue flushes the current frame to the remote server
func (p *Peer) processSendQueue() {
	if len(p.frame) == 0 {
		return // Nothing to send.
	}

	// Compress in-memory. TODO: Optimize the shit out of that, we don't really need to use binc
	buffer := bytes.NewBuffer(nil)
	snappy := snappy.NewBufferedWriter(buffer)
	writer := encoding.NewEncoder(snappy)

	// Encode the current frame
	p.Lock()
	err := writer.Encode(p.frame)
	p.frame = p.frame[:0]
	p.Unlock()

	// Something went wrong during the encoding
	if err != nil {
		logging.LogError("peer", "encoding frame", err)
	}

	// Send the frame directly to the peer.
	if err := snappy.Close(); err == nil {
		if err := p.sender.GossipUnicast(p.name, buffer.Bytes()); err != nil {
			//logging.LogError("peer", "gossip unicast", err)
		}
	}
}
