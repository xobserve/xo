package cluster

import (
	"bytes"
	"encoding/binary"

	"github.com/teamsaas/meq/broker/subscription"
	"github.com/teamsaas/meq/common/collection"
	"github.com/teamsaas/meq/common/encode"
	"github.com/teamsaas/meq/common/security"
	"github.com/weaveworks/mesh"
)

// MessageFrame represents a message frame which is sent through the wire to the
// remote server and contains a set of messages
type MessageFrame []*Message

// Message represents a message which has to be routed.
type Message struct {
	Ssid    subscription.Ssid // The Ssid of the message
	Channel []byte            // The channel of the message
	Payload []byte            // The payload of the message
}

// decodeMessageFrame decodes the message frame from the decoder.
func decodeMessageFrame(decoder encode.Decoder) (out MessageFrame, err error) {
	out = make(MessageFrame, 0, 64)
	err = decoder.Decode(&out)
	return
}

// SubscriptionEvent represents a subscription event.
type SubscriptionEvent struct {
	Ssid subscription.Ssid // The SSID for the subscription.
	Peer mesh.PeerName     // The name of the peer.
	Conn security.ID       // The connection identifier.
}

// Encode encodes the event to string representation.
func (e *SubscriptionEvent) Encode() string {

	// Prepare a buffer and leave some space, since we're encoding in varint
	buf := make([]byte, 20+(6*len(e.Ssid)))
	offset := 0

	// Encode everything as variable-size unsigned integers to save space
	offset += binary.PutUvarint(buf[offset:], uint64(e.Peer))
	offset += binary.PutUvarint(buf[offset:], uint64(e.Conn))
	for _, ssidPart := range e.Ssid {
		offset += binary.PutUvarint(buf[offset:], uint64(ssidPart))
	}

	return string(buf[:offset])
}

// decodeSubscriptionEvent decodes the event
func decodeSubscriptionEvent(encoded string) (SubscriptionEvent, error) {
	out := SubscriptionEvent{}
	buf := []byte(encoded)

	reader := bytes.NewReader(buf)

	// Read the peer name
	peer, err := binary.ReadUvarint(reader)
	out.Peer = mesh.PeerName(peer)
	if err != nil {
		return out, err
	}

	// Read the connection identifier
	conn, err := binary.ReadUvarint(reader)
	out.Conn = security.ID(conn)
	if err != nil {
		return out, err
	}

	// Read the SSID until we're finished
	out.Ssid = make([]uint32, 0, 2)
	for reader.Len() > 0 {
		ssidPart, err := binary.ReadUvarint(reader)
		out.Ssid = append(out.Ssid, uint32(ssidPart))
		if err != nil {
			return out, err
		}
	}

	return out, nil
}

// SubscriptionState represents globally synchronised state.
type subscriptionState collection.LWWSet

// newSubscriptionState creates a new last-write-wins set with bias for 'add'.
func newSubscriptionState() *subscriptionState {
	return (*subscriptionState)(collection.NewLWWSet())
}

// decodeSubscriptionState decodes the state
func decodeSubscriptionState(buf []byte) (*subscriptionState, error) {
	out := map[interface{}]collection.LWWTime{}

	err := encode.Decode(buf, &out)
	return &subscriptionState{Set: out}, err
}

// Encode serializes our complete state to a slice of byte-slices.
func (st *subscriptionState) Encode() [][]byte {
	lww := (*collection.LWWSet)(st)
	lww.Lock()
	defer lww.Unlock()

	buf, err := encode.Encode(lww.Set)
	if err != nil {
		panic(err)
	}

	return [][]byte{buf}
}

// Merge merges the other GossipData into this one,
// and returns our resulting, complete state.
func (st *subscriptionState) Merge(other mesh.GossipData) (complete mesh.GossipData) {
	lww := (*collection.LWWSet)(st)

	otherState := other.(*subscriptionState)
	otherLww := (*collection.LWWSet)(otherState)

	lww.Merge(otherLww) // Merges and changes otherState to be a delta
	return otherState   // Return the delta after merging
}

// Add adds the subscription event to the state.
func (st *subscriptionState) Add(ev string) {
	(*collection.LWWSet)(st).Add(ev)
}

// Remove removes the subscription event from the state.
func (st *subscriptionState) Remove(ev string) {
	(*collection.LWWSet)(st).Remove(ev)
}

// All ...
func (st *subscriptionState) All() map[interface{}]collection.LWWTime {
	return (*collection.LWWSet)(st).All()
}
