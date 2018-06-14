package service

import (
	"bytes"
	"fmt"

	"github.com/cosmos-gg/meq/proto"
	"github.com/weaveworks/mesh"
)

var mockMsgs = []*proto.PubMsg{
	&proto.PubMsg{[]byte("001"), []byte("/test/g1/+/b1"), []byte("hello world1"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("002"), []byte("/test/g1/+/b1"), []byte("hello world2"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("003"), []byte("/test/g1/+/b1"), []byte("hello world3"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("004"), []byte("/test/g1/+/b1"), []byte("hello world4"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("005"), []byte("/test/g1/+/b1"), []byte("hello world5"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("006"), []byte("/test/g1/+/b1"), []byte("hello world6"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("007"), []byte("/test/g1/+/b1"), []byte("hello world7"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("008"), []byte("/test/g1/+/b1"), []byte("hello world8"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("009"), []byte("/test/g1/+/b1"), []byte("hello world9"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("010"), []byte("/test/g1/+/b1"), []byte("hello world10"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("011"), []byte("/test/g1/+/b1"), []byte("hello world11"), false, 0, 1, 100},
}

var mockExactMsgs = []*proto.PubMsg{
	&proto.PubMsg{[]byte("011"), []byte("/test/g1"), []byte("hello world11"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("010"), []byte("/test/g1"), []byte("hello world10"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("009"), []byte("/test/g1"), []byte("hello world9"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("008"), []byte("/test/g1"), []byte("hello world8"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("007"), []byte("/test/g1"), []byte("hello world7"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("006"), []byte("/test/g1"), []byte("hello world6"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("005"), []byte("/test/g1"), []byte("hello world5"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("004"), []byte("/test/g1"), []byte("hello world4"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("003"), []byte("/test/g1"), []byte("hello world3"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("002"), []byte("/test/g1"), []byte("hello world2"), false, 0, 1, 100},
	&proto.PubMsg{[]byte("001"), []byte("/test/g1"), []byte("hello world1"), false, 0, 1, 100},
}

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
