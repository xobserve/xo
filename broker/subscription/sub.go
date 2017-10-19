package subscription

import (
	"encoding/binary"
	"encoding/hex"
	"reflect"
	"sync"
	"time"
	"unsafe"

	"github.com/teamsaas/meq/common/channel"
)

// Various constant parts of the SSID.
const (
	system   = uint32(0)
	presence = uint32(3869262148)
	query    = uint32(3939663052)
	wildcard = uint32(1815237614)
)

// Query represents a constant SSID for a query.
var Query = Ssid{system, query}

// Ssid represents a subscription ID which contains a contract and a list of hashes
// for various parts of the channel.
type Ssid []uint32

// NewSsid creates a new SSID.
func NewSsid(contract uint32, c *channel.Channel) Ssid {
	ssid := make([]uint32, 0, len(c.Query)+1)
	ssid = append(ssid, uint32(contract))
	ssid = append(ssid, c.Query...)
	return ssid
}

// NewSsidForPresence creates a new SSID for presence.
func NewSsidForPresence(original Ssid) Ssid {
	ssid := make([]uint32, 0, len(original)+2)
	ssid = append(ssid, system)
	ssid = append(ssid, presence)
	ssid = append(ssid, original...)
	return ssid
}

// Contract gets the contract part from SSID.
func (s Ssid) Contract() uint32 {
	return uint32(s[0])
}

// GetHashCode combines the SSID into a single hash.
func (s Ssid) GetHashCode() uint32 {
	h := s[0]
	for _, i := range s[1:] {
		h ^= i
	}
	return h
}

// Encode encodes the SSID to a binary format
func (s Ssid) Encode() string {
	bin := make([]byte, 4)
	out := make([]byte, len(s)*8)

	for i, v := range s {
		if v != wildcard {
			binary.BigEndian.PutUint32(bin, v)
			hex.Encode(out[i*8:i*8+8], bin)
		} else {
			// If we have a wildcard specified, use dot '.' symbol so this becomes a valid
			// regular expression and we could also use this for querying.
			copy(out[i*8:i*8+8], []byte{0x2E, 0x2E, 0x2E, 0x2E, 0x2E, 0x2E, 0x2E, 0x2E})
		}
	}
	return unsafeToString(out)
}

func unsafeToString(b []byte) string {
	bh := (*reflect.SliceHeader)(unsafe.Pointer(&b))
	sh := reflect.StringHeader{bh.Data, bh.Len}
	return *(*string)(unsafe.Pointer(&sh))
}

// ------------------------------------------------------------------------------------

// Awaiter represents an asynchronously awaiting response channel.
type Awaiter interface {
	Gather(time.Duration) [][]byte
}

// ------------------------------------------------------------------------------------

// SubscriberType represents a type of subscriber
type SubscriberType uint8

// Subscriber types
const (
	SubscriberDirect = SubscriberType(iota)
	SubscriberRemote
)

// Subscriber is a value associated with a subscription.
type Subscriber interface {
	ID() string
	Type() SubscriberType
	Send(ssid Ssid, channel []byte, payload []byte) error
}

// ------------------------------------------------------------------------------------

// Subscribers represents a subscriber set which can contain only unique values.
type Subscribers []Subscriber

// AddUnique adds a subscriber to the set.
func (s *Subscribers) AddUnique(value Subscriber) {
	if s.Contains(value) == false {
		*s = append(*s, value)
	}
}

// Contains checks whether a subscriber is in the set.
func (s *Subscribers) Contains(value Subscriber) bool {
	for _, v := range *s {
		if v == value {
			return true
		}
	}
	return false
}

// Subscription represents a topic subscription.
type Subscription struct {
	Ssid       Ssid       // Gets or sets the SSID (parsed channel) for this subscription.
	Subscriber Subscriber // Gets or sets the subscriber for this subscription.
}

// ------------------------------------------------------------------------------------

// Counters represents a subscription counting map.
type Counters struct {
	sync.Mutex
	m map[uint32]*Counter
}

// Counter represents a single subscription counter.
type Counter struct {
	Ssid    Ssid
	Channel []byte
	Counter int
}

// NewCounters creates a new container.
func NewCounters() *Counters {
	return &Counters{
		m: make(map[uint32]*Counter),
	}
}

// Increment increments the subscription counter.
func (s *Counters) Increment(ssid Ssid, channel []byte) (first bool) {
	s.Lock()
	defer s.Unlock()

	m := s.getOrCreate(ssid, channel)
	m.Counter++
	return m.Counter == 1
}

// Decrement decrements a subscription counter.
func (s *Counters) Decrement(ssid Ssid) (last bool) {
	s.Lock()
	defer s.Unlock()

	key := ssid.GetHashCode()
	if m, exists := s.m[key]; exists {
		m.Counter--

		// Remove if there's no subscribers left
		if m.Counter <= 0 {
			delete(s.m, ssid.GetHashCode())
			return true
		}
	}

	return false
}

// All returns all counters.
func (s *Counters) All() []Counter {
	s.Lock()
	defer s.Unlock()

	clone := make([]Counter, 0, len(s.m))
	for _, m := range s.m {
		clone = append(clone, *m)
	}

	return clone
}

// getOrCreate retrieves a single subscription meter or creates a new one.
func (s *Counters) getOrCreate(ssid Ssid, channel []byte) (meter *Counter) {
	key := ssid.GetHashCode()
	if m, exists := s.m[key]; exists {
		return m
	}

	meter = &Counter{
		Ssid:    ssid,
		Channel: channel,
		Counter: 0,
	}
	s.m[key] = meter
	return
}
