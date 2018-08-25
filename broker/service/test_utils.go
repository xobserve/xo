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
	"bytes"
	"fmt"

	"github.com/mafanr/meq/proto"
	"github.com/weaveworks/mesh"
)

var mockMsgs = []*proto.PubMsg{
	&proto.PubMsg{[]byte("123"), []byte("001"), []byte("/test/g1/+/b1"), []byte("hello world1"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("002"), []byte("/test/g1/+/b1"), []byte("hello world2"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("003"), []byte("/test/g1/+/b1"), []byte("hello world3"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("004"), []byte("/test/g1/+/b1"), []byte("hello world4"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("005"), []byte("/test/g1/+/b1"), []byte("hello world5"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("006"), []byte("/test/g1/+/b1"), []byte("hello world6"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("007"), []byte("/test/g1/+/b1"), []byte("hello world7"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("008"), []byte("/test/g1/+/b1"), []byte("hello world8"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("009"), []byte("/test/g1/+/b1"), []byte("hello world9"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("010"), []byte("/test/g1/+/b1"), []byte("hello world10"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("011"), []byte("/test/g1/+/b1"), []byte("hello world11"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
}

var mockExactMsgs = []*proto.PubMsg{
	&proto.PubMsg{[]byte("123"), []byte("011"), []byte("/test/g1"), []byte("hello world11"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("010"), []byte("/test/g1"), []byte("hello world10"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("009"), []byte("/test/g1"), []byte("hello world9"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("008"), []byte("/test/g1"), []byte("hello world8"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("007"), []byte("/test/g1"), []byte("hello world7"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("006"), []byte("/test/g1"), []byte("hello world6"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("005"), []byte("/test/g1"), []byte("hello world5"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("004"), []byte("/test/g1"), []byte("hello world4"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("003"), []byte("/test/g1"), []byte("hello world3"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("002"), []byte("/test/g1"), []byte("hello world2"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
	&proto.PubMsg{[]byte("123"), []byte("001"), []byte("/test/g1"), []byte("hello world1"), false, 0, 1, 100, []byte("sunface"), []byte("111")},
}

// var mockSubs = []SubData{
// 	SubData{[]byte("/test/g1/a1/b1"), 1, mesh.PeerName(1)},
// 	SubData{[]byte("/test/g2/a1/b1/c1"), 2, mesh.PeerName(2)},
// 	SubData{[]byte("/test/g1/a1/b1/c1"), 3, mesh.PeerName(1)},
// 	SubData{[]byte("/test/g2/a1/b1/c1"), 4, mesh.PeerName(2)},
// 	SubData{[]byte("/test/g1/a1/b1/c1/d1/e1"), 5, mesh.PeerName(1)},
// 	SubData{[]byte("/test/g1/a1/b1/c1/d1/e2"), 5, mesh.PeerName(2)},
// 	SubData{[]byte("/test/g2/a1/b2/c1"), 6, mesh.PeerName(2)},
// 	SubData{[]byte("/test/g1/a1/b2/c2"), 7, mesh.PeerName(2)},
// 	SubData{[]byte("/test/g2/a2/b1/c1"), 8, mesh.PeerName(1)},
// }

func populateSubs(st *SubTrie) {
	n := 0
	for i := 1; i <= 10; i++ {
		for j := 1; j <= 4; j++ {
			for k := 1; k <= 10; k++ {
				for l := 1; l <= 1000; l++ {
					n++
					topic := []byte(fmt.Sprintf("/test/g1/%d/b1/%d/%d/%d", i, j, k, l))
					addr := 1
					if i%2 == 0 {
						addr = 2
					}
					st.Subscribe(topic, uint64(n), mesh.PeerName(addr), []byte("aa"))
				}
			}
		}
	}
}

type topicSubs []TopicSub

func (a topicSubs) Len() int { // 重写 Len() 方法
	return len(a)
}
func (a topicSubs) Swap(i, j int) { // 重写 Swap() 方法
	a[i], a[j] = a[j], a[i]
}
func (a topicSubs) Less(i, j int) bool { // 重写 Less() 方法， 从大到小排序
	n := bytes.Compare(a[i].Topic, a[j].Topic)
	if n >= 0 {
		return true
	}
	return false
}
