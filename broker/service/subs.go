package service

import (
	"bytes"
	"encoding/gob"
	"sync"

	"github.com/weaveworks/mesh"
)

type Subs map[string][]*SubGroup

type SubGroup struct {
	ID     []byte
	Sesses []Sess
}
type Sess struct {
	Addr mesh.PeerName
	Cid  uint64
}

var sublock = &sync.RWMutex{}

// make sure the Subs is mesh.GossipData type
var _ mesh.GossipData = make(Subs)

// Encode serializes our complete state to a slice of byte-slices.
// In this simple example, we use a single gob-encoded
// buffer: see https://golang.org/pkg/encoding/gob/
func (st Subs) Encode() [][]byte {
	sublock.RLock()
	defer sublock.RUnlock()

	var buf bytes.Buffer
	if err := gob.NewEncoder(&buf).Encode(st); err != nil {
		panic(err)
	}
	return [][]byte{buf.Bytes()}
}

// Merge merges the other GossipData into this one,
// and returns our resulting, complete state.
func (st Subs) Merge(osubs mesh.GossipData) (complete mesh.GossipData) {
	sublock.Lock()
	defer sublock.Unlock()
	for otopic, ogroups := range osubs.(Subs) {
		groups, ok := st[otopic]
		// 传入的otopic是否存在
		if !ok {
			// 不存在，则直接把该otopic插入
			st[otopic] = ogroups
			continue
		} else {
			// 存在，则检查ogroup是否存在
			for _, ogroup := range ogroups {
				exist := false
				// 检查当前ogroup是否存在
				for _, group := range groups {
					// ogroup存在，则检查ogroup底下的sess
					if bytes.Compare(group.ID, ogroup.ID) == 0 {
						exist = true
						// 检查osess是否存在
						for _, osess := range ogroup.Sesses {
							sexist := false
							for _, sess := range group.Sesses {
								// osess已存在
								if sess.Addr == osess.Addr && sess.Cid == osess.Cid {
									sexist = true
								}
							}
							if !sexist {
								// osess不存在
								group.Sesses = append(group.Sesses, osess)
							}
						}
						continue
					}
				}
				// 不存在，则直接插入该group
				if !exist {
					st[otopic] = append(st[otopic], ogroup)
				}
			}
		}
	}

	return
}

type SubMessage struct {
	TP    int
	Topic []byte
	Group []byte
	Cid   uint64
}

func (st SubMessage) Encode() [][]byte {
	// sync to other nodes
	var buf bytes.Buffer
	if err := gob.NewEncoder(&buf).Encode(st); err != nil {
		panic(err)
	}

	return [][]byte{buf.Bytes()}
}

func (st SubMessage) Merge(new mesh.GossipData) (complete mesh.GossipData) {
	return
}
