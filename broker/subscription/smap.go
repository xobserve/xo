package subscription

import (
	"sync"
)

type Smap struct {
	m *sync.Map
	sync.RWMutex
}

func NewSmap() (s *Smap) {
	return &Smap{
		m: &sync.Map{},
	}
}

func (s *Smap) Subscribe(ssid Ssid, sub Subscriber) (*Subscription, error) {
	for index := 1; index < len(ssid); index++ {
		if index == 0 {
			continue
		}
		subsm, ok := s.m.Load(ssid[index])
		if ok {
			subs := subsm.(*sync.Map)
			subs.Store(sub.ID(), sub)
		} else {
			s.RLock()
			subs := &sync.Map{}
			subs.Store(sub.ID(), sub)
			s.m.Store(ssid[index], subs)
			s.RUnlock()
		}
	}
	return &Subscription{
		Ssid:       ssid,
		Subscriber: sub,
	}, nil
}

func (s *Smap) Unsubscribe(ssid Ssid, sub Subscriber) error {
	for index := 1; index < len(ssid); index++ {
		subsm, ok := s.m.Load(ssid[index])
		if ok {
			subs := subsm.(*sync.Map)
			subs.Delete(sub.ID())
		}
	}
	return nil
}

func (s *Smap) Lookup(query Ssid) Subscribers {
	var ss Subscribers
	m0 := make(map[string]string)
	for index := 1; index < len(query); index++ {
		subsm, ok := s.m.Load(query[index])
		if ok {
			subs := subsm.(*sync.Map)
			subs.Range(func(key, value interface{}) bool {
				id := key.(string)
				if m0[id] == "" {
					m0[id] = id
					sub := value.(Subscriber)
					ss = append(ss, sub)
				}
				return true
			})
		}
	}
	return ss
}
