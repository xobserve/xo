//  Copyright © 2018 Sunface <CTO@188.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package service

import (
	"sort"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/weaveworks/mesh"
)

type SubData struct {
	Topic []byte
	Cid   uint64
	Addr  mesh.PeerName
}

// a1:354238002 , b1: 4114052237,c1:1943813973, d1: 3929575225
// a2: 2033241478 b2 : 3684110692 c2: 2262372255
func TestTrieSubAndLookup(t *testing.T) {
	st := NewSubTrie()
	inputs := []SubData{
		SubData{[]byte("/1234567890/1/a1/b1/c1"), 1, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/1/a1/b1/c1"), 2, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/1/a1/b1/c1"), 3, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/1/a1/b1/c1"), 4, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/1/a1/b1/c2/d1/e1"), 5, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/1/a1/b1/c1/d1/e2"), 5, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/1/a1/b2/c1"), 6, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/1/a1/b2/c2"), 7, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/1/a1/b1/c2/d1"), 8, mesh.PeerName(1)},
	}
	outputs := topicSubs{
		TopicSub{[]byte("/1234567890/1/a1/b1/c2/d1"), Sub{mesh.PeerName(1), 8, nil}},
		TopicSub{[]byte("/1234567890/1/a1/b2/c2"), Sub{mesh.PeerName(2), 7, nil}},
		TopicSub{[]byte("/1234567890/1/a1/b1/c2/d1/e1"), Sub{mesh.PeerName(1), 5, nil}},
	}
	sort.Sort(outputs)

	for _, input := range inputs {
		st.Subscribe(input.Topic, input.Cid, input.Addr, nil)
	}

	vs, _ := st.Lookup([]byte("/1234567890/1/a1/+/c2"))
	sort.Sort(topicSubs(vs))

	assert.EqualValues(t, outputs, vs)
}

func TestTrieSubAndLookupExactlyOne(t *testing.T) {
	st := NewSubTrie()
	inputs := []SubData{
		SubData{[]byte("/1234567890/1/a1/b1/c1"), 1, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/1/a1/b1/c1"), 2, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/1/a1/b1/c1"), 3, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/1/a1/b1/c1"), 4, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/1/a1/b1/c1/d1"), 5, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/1/a1/b2/c2"), 6, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/1/a2/b1/c1"), 7, mesh.PeerName(1)},
	}

	outputs := topicSubs{
		TopicSub{[]byte("/1234567890/1/a1/b1/c1"), Sub{mesh.PeerName(2), 2, nil}},
	}
	sort.Sort(outputs)

	for _, input := range inputs {
		st.Subscribe(input.Topic, input.Cid, input.Addr, nil)
	}

	vs, _ := st.LookupExactly([]byte("/1234567890/1/a1/b1/c1"))
	sort.Sort(topicSubs(vs))

	assert.EqualValues(t, outputs, vs)
}

func TestTrieSubAndLookupExactlyAll(t *testing.T) {
	st := NewSubTrie()
	inputs := []SubData{
		SubData{[]byte("/1234567890/2/a1/b1/c1"), 1, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/2/a1/b1/c1"), 2, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/2/a1/b1/c1"), 3, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/2/a1/b1/c1"), 4, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/2/a1/b1/c1/d1"), 5, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/2/a1/b2/c2"), 6, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/2/a2/b1/c1"), 7, mesh.PeerName(1)},
	}

	outputs := topicSubs{
		TopicSub{[]byte("/1234567890/2/a1/b1/c1"), Sub{mesh.PeerName(1), 1, nil}},
		TopicSub{[]byte("/1234567890/2/a1/b1/c1"), Sub{mesh.PeerName(2), 2, nil}},
		TopicSub{[]byte("/1234567890/2/a1/b1/c1"), Sub{mesh.PeerName(1), 3, nil}},
		TopicSub{[]byte("/1234567890/2/a1/b1/c1"), Sub{mesh.PeerName(2), 4, nil}},
	}
	sort.Sort(outputs)

	for _, input := range inputs {
		st.Subscribe(input.Topic, input.Cid, input.Addr, nil)
	}

	vs, _ := st.LookupExactly([]byte("/1234567890/2/a1/b1/c1"))
	sort.Sort(topicSubs(vs))

	assert.EqualValues(t, outputs, vs)
}

func TestTrieUnsubAndLookup(t *testing.T) {
	st := NewSubTrie()
	inputs := []SubData{
		SubData{[]byte("/1234567890/2/a1/b1/c1"), 1, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/2/a1/b1/c1"), 2, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/2/a1/b1/c1/d1/e1"), 5, mesh.PeerName(1)},
		SubData{[]byte("/1234567890/2/a1/b1/c1/d1/e2"), 5, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/2/a1/b2/c1"), 6, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/2/a1/b2/c2"), 7, mesh.PeerName(2)},
		SubData{[]byte("/1234567890/2/a2/b1/c1"), 8, mesh.PeerName(1)},
	}

	for _, input := range inputs {
		st.Subscribe(input.Topic, input.Cid, input.Addr, nil)
	}

	unsubdata := inputs[0]
	st.UnSubscribe(unsubdata.Topic, unsubdata.Cid, unsubdata.Addr)
	unsubdata = inputs[3]
	st.UnSubscribe(unsubdata.Topic, unsubdata.Cid, unsubdata.Addr)

	outputs := topicSubs{
		TopicSub{[]byte("/1234567890/2/a1/b1/c1"), Sub{mesh.PeerName(2), 2, nil}},
		TopicSub{[]byte("/1234567890/2/a1/b1/c1/d1/e1"), Sub{mesh.PeerName(1), 5, nil}},
		TopicSub{[]byte("/1234567890/2/a1/b2/c1"), Sub{mesh.PeerName(2), 6, nil}},
	}
	sort.Sort(outputs)

	vs, _ := st.Lookup([]byte("/1234567890/2/a1/+/c1"))
	sort.Sort(topicSubs(vs))

	assert.EqualValues(t, outputs, vs)
}

func BenchmarkTrieSubscribe(b *testing.B) {
	// st := NewSubTrie()

	// b.ReportAllocs()
	// b.ResetTimer()

	// for i := 0; i < b.N; i++ {
	// 	n := 1
	// 	if i%2 == 0 {
	// 		n = 2
	// 	}
	// 	topic := []byte(fmt.Sprintf("/%d/%d/%d/%d", 100, n, n, n))
	// 	queue := []byte("test1")
	// 	addr := 1
	// 	if i%2 == 0 {
	// 		queue = []byte("test2")
	// 		addr = 2
	// 	}
	// 	st.Subscribe(topic, queue, uint64(i), mesh.PeerName(addr))
	// }
}

// get 100K results from 4000K subs
func BenchmarkTrieLookup(b *testing.B) {
	st := NewSubTrie()
	populateSubs(st)

	b.ReportAllocs()
	b.ResetTimer()

	t := []byte("/test/g1/1/b1/1")
	for i := 0; i < b.N; i++ {
		v, err := st.Lookup(t)
		if err != nil {
			b.Fatal(err, len(v))
		}
	}
}

func BenchmarkTrieLookupExactly(b *testing.B) {
	st := NewSubTrie()
	populateSubs(st)

	b.ReportAllocs()
	b.ResetTimer()

	t := []byte("/test/g1/5/b1")
	for i := 0; i < b.N; i++ {
		st.LookupExactly(t)
	}
}
