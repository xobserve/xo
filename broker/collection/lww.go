package collection

import (
	"sync"
	"time"
)

// LWWTime represents a time pair.
type LWWTime struct {
	AddTime int64
	DelTime int64
}

// IsZero checks if the time is zero
func (t LWWTime) IsZero() bool {
	return t.AddTime == 0 && t.DelTime == 0
}

// IsAdded checks if add time is larger than remove time.
func (t LWWTime) IsAdded() bool {
	return t.AddTime != 0 && t.AddTime >= t.DelTime
}

// IsRemoved checks if remove time is larger than add time.
func (t LWWTime) IsRemoved() bool {
	return t.AddTime < t.DelTime
}

// LWWSet represents a last-write-wins CRDT set.
type LWWSet struct {
	sync.Mutex
	Set map[interface{}]LWWTime
}

// NewLWWSet creates a new last-write-wins set with bias for 'add'.
func NewLWWSet() *LWWSet {
	return &LWWSet{
		Set: make(map[interface{}]LWWTime),
	}
}

// Add adds a value to the set.
func (s *LWWSet) Add(value interface{}) {
	s.Lock()
	v, _ := s.Set[value]
	s.Set[value] = LWWTime{AddTime: time.Now().UnixNano(), DelTime: v.DelTime}
	s.Unlock()
}

// Remove removes the value from the set.
func (s *LWWSet) Remove(value interface{}) {
	s.Lock()
	v, _ := s.Set[value]
	s.Set[value] = LWWTime{AddTime: v.AddTime, DelTime: time.Now().UnixNano()}
	s.Unlock()
}

// Contains checks if a value is present in the set.
func (s *LWWSet) Contains(value interface{}) bool {
	s.Lock()
	v, _ := s.Set[value]
	s.Unlock()
	return v.IsAdded()
}

// Merge merges two LWW sets. This also modifies the set being merged in
// to leave only the delta.
func (s *LWWSet) Merge(r *LWWSet) {
	s.Lock()
	defer s.Unlock()

	for key, rt := range r.Set {
		t, _ := s.Set[key]

		if t.AddTime < rt.AddTime {
			t.AddTime = rt.AddTime
		} else {
			rt.AddTime = 0 // Remove from delta
		}

		if t.DelTime < rt.DelTime {
			t.DelTime = rt.DelTime
		} else {
			rt.DelTime = 0 // Remove from delta
		}

		if rt.IsZero() {
			delete(r.Set, key) // Remove from delta
		} else {
			s.Set[key] = t  // Merge the new value
			r.Set[key] = rt // Update the delta
		}
	}
}

// All gets all items in the set.
func (s *LWWSet) All() map[interface{}]LWWTime {
	items := make(map[interface{}]LWWTime, len(s.Set))
	s.Lock()
	for key, val := range s.Set {
		items[key] = val
	}
	s.Unlock()
	return items
}
