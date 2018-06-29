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
	"encoding/gob"
	"errors"
	"math/rand"
	"sync"

	"github.com/meqio/meq/proto"
	"github.com/weaveworks/mesh"
)

type Node struct {
	ID       uint32
	Topic    []byte
	Subs     []Sub
	Children map[uint32]*Node
}

type SubTrie struct {
	Roots map[uint32]*Node
}

type Sub struct {
	Addr     mesh.PeerName
	Cid      uint64
	UserName []byte
}

type TopicSub struct {
	Topic []byte
	Sub   Sub
}

const subCacheLen = 1000

var subCache = make(map[string]int)

var (
	sublock = &sync.RWMutex{}
)

func NewSubTrie() *SubTrie {
	return &SubTrie{
		Roots: make(map[uint32]*Node),
	}
}

func (st *SubTrie) Subscribe(topic []byte, cid uint64, addr mesh.PeerName, un []byte) error {
	tids, err := proto.ParseTopic(topic, true)
	if err != nil {
		return err
	}

	rootid := tids[0]
	last := tids[len(tids)-1]

	sublock.RLock()
	root, ok := st.Roots[rootid]
	sublock.RUnlock()

	if !ok {
		root = &Node{
			ID:       rootid,
			Children: make(map[uint32]*Node),
		}
		sublock.Lock()
		st.Roots[rootid] = root
		sublock.Unlock()
	}

	curr := root
	for _, tid := range tids[1:] {
		sublock.RLock()
		child, ok := curr.Children[tid]
		sublock.RUnlock()
		if !ok {
			child = &Node{
				ID:       tid,
				Children: make(map[uint32]*Node),
			}
			sublock.Lock()
			curr.Children[tid] = child
			sublock.Unlock()
		}

		curr = child
		// if encounters the last node in the tree branch, we should add topic to the subs of this node
		if tid == last {
			curr.Topic = topic
			sublock.Lock()
			curr.Subs = append(curr.Subs, Sub{addr, cid, un})
			sublock.Unlock()
		}
	}

	return nil
}

func (st *SubTrie) UnSubscribe(topic []byte, cid uint64, addr mesh.PeerName) error {
	tids, err := proto.ParseTopic(topic, true)
	if err != nil {
		return err
	}
	rootid := tids[0]
	last := tids[len(tids)-1]

	sublock.RLock()
	root, ok := st.Roots[rootid]
	sublock.RUnlock()

	if !ok {
		return errors.New("no subscribe info")
	}

	curr := root
	for _, tid := range tids[1:] {
		sublock.RLock()
		child, ok := curr.Children[tid]
		sublock.RUnlock()
		if !ok {
			return errors.New("no subscribe info")
		}

		curr = child
		// if encounters the last node in the tree branch, we should remove topic in this node
		if tid == last {
			sublock.Lock()
			for i, sub := range curr.Subs {
				if sub.Cid == cid && sub.Addr == addr {
					curr.Subs = append(curr.Subs[:i], curr.Subs[i+1:]...)
					break
				}
			}
			sublock.Unlock()
		}
	}

	return nil
}

//@todo
// add query cache for heavy lookup
func (st *SubTrie) Lookup(topic []byte) ([]TopicSub, error) {
	t := string(topic)

	tids, err := proto.ParseTopic(topic, false)
	if err != nil {
		return nil, err
	}

	_, sendtag, _, err := proto.AppidAndSendTag(topic)
	if err != nil {
		return nil, err
	}
	//@todo validate the appid

	var subs []TopicSub
	sublock.RLock()
	cl, ok := subCache[t]
	sublock.RUnlock()
	if ok {
		subs = make([]TopicSub, 0, cl+100)
	} else {
		subs = make([]TopicSub, 0, 10)
	}

	rootid := tids[0]

	sublock.RLock()
	root, ok := st.Roots[rootid]
	sublock.RUnlock()
	if !ok {
		return nil, nil
	}

	// 所有比target长的都应该收到
	// target中的通配符'+'可以匹配任何tid
	// 找到所有路线的最后一个node节点

	var lastNodes []*Node
	if len(tids) == 1 {
		lastNodes = append(lastNodes, root)
	} else {
		st.findLastNodes(root, tids[1:], &lastNodes)
	}

	// 找到lastNode的所有子节点
	sublock.RLock()
	for _, last := range lastNodes {
		st.findSubs(last, &subs, sendtag)
	}
	sublock.RUnlock()

	//@todo
	//Remove duplicate elements from the list.
	if len(subs) >= subCacheLen {
		sublock.Lock()
		subCache[string(topic)] = len(subs)
		sublock.Unlock()
	}
	return subs, nil
}

func (st *SubTrie) LookupExactly(topic []byte) ([]TopicSub, error) {
	tids, err := proto.ParseTopic(topic, true)
	if err != nil {
		return nil, err
	}
	_, sendtag, _, err := proto.AppidAndSendTag(topic)
	if err != nil {
		return nil, err
	}
	//@todo validate the appid

	rootid := tids[0]

	sublock.RLock()
	root, ok := st.Roots[rootid]
	sublock.RUnlock()
	if !ok {
		return nil, nil
	}

	// 所有比target长的都应该收到
	// target中的通配符'+'可以匹配任何tid
	// 找到所有路线的最后一个node节点
	lastNode := root
	for _, tid := range tids[1:] {
		// 任何一个node匹配不到，则认为完全无法匹配
		node, ok := lastNode.Children[tid]
		if !ok {
			return nil, nil
		}

		lastNode = node
	}

	if len(lastNode.Subs) == 0 {
		return nil, nil
	}

	var subs []TopicSub
	// optimize the random performance
	if sendtag == proto.TopicSendAll {
		for _, sub := range lastNode.Subs {
			subs = append(subs, TopicSub{lastNode.Topic, sub})
		}
	} else {
		if len(lastNode.Subs) == 1 {
			subs = append(subs, TopicSub{lastNode.Topic, lastNode.Subs[0]})
		} else {
			subs = append(subs, TopicSub{lastNode.Topic, lastNode.Subs[rand.Intn(len(lastNode.Subs))]})
		}
	}

	return subs, nil
}

func (st *SubTrie) GetPrensence(topic []byte) [][]byte {
	tids, err := proto.ParseTopic(topic, true)
	if err != nil {
		return nil
	}

	rootid := tids[0]

	sublock.RLock()
	root, ok := st.Roots[rootid]
	sublock.RUnlock()
	if !ok {
		return nil
	}

	// 所有比target长的都应该收到
	// target中的通配符'+'可以匹配任何tid
	// 找到所有路线的最后一个node节点
	lastNode := root
	for _, tid := range tids[1:] {
		// 任何一个node匹配不到，则认为完全无法匹配
		node, ok := lastNode.Children[tid]
		if !ok {
			return nil
		}

		lastNode = node
	}

	if len(lastNode.Subs) == 0 {
		return nil
	}

	res := make([][]byte, 0, len(lastNode.Subs))
	for _, sub := range lastNode.Subs {
		res = append(res, sub.UserName)
	}
	return res
}

func (st *SubTrie) findSubs(n *Node, subs *[]TopicSub, sendtag byte) {
	// manually realloc the slice
	if cap(*subs) == len(*subs) {
		temp := make([]TopicSub, len(*subs), cap(*subs)*6)
		copy(temp, *subs)
		*subs = temp
	}

	if len(n.Subs) > 0 {
		// optimize the random performance
		if sendtag == proto.TopicSendOne {
			var sub Sub
			if len(n.Subs) == 1 {
				sub = n.Subs[0]
			} else {
				sub = n.Subs[rand.Intn(len(n.Subs))]
			}
			*subs = append(*subs, TopicSub{n.Topic, sub})
		} else {
			for _, sub := range n.Subs {
				*subs = append(*subs, TopicSub{n.Topic, sub})
			}
		}
	}

	if len(n.Children) == 0 {
		return
	}
	for _, child := range n.Children {
		st.findSubs(child, subs, sendtag)
	}
}

func (st *SubTrie) findLastNodes(n *Node, tids []uint32, nodes *[]*Node) {
	if len(tids) == 1 {
		// 如果只剩一个节点，那就直接查找，不管能否找到，都返回
		node, ok := n.Children[tids[0]]
		if ok {
			*nodes = append(*nodes, node)
		}
		return
	}

	tid := tids[0]
	if tid != proto.WildCardHash {
		node, ok := n.Children[tid]
		if !ok {
			return
		}
		st.findLastNodes(node, tids[1:], nodes)
	} else {
		for _, node := range n.Children {
			st.findLastNodes(node, tids[1:], nodes)
		}
	}
}

// cluster interface

var _ mesh.GossipData = &SubTrie{}

// Encode serializes our complete state to a slice of byte-slices.
// In this simple example, we use a single gob-encoded
// buffer: see https://golang.org/pkg/encoding/gob/
// @todo compress the data
func (st *SubTrie) Encode() [][]byte {
	sublock.RLock()
	defer sublock.RUnlock()

	var buf bytes.Buffer
	if err := gob.NewEncoder(&buf).Encode(st); err != nil {
		panic(err)
	}
	msg := make([]byte, len(buf.Bytes())+5)
	msg[4] = CLUSTER_SUBS_SYNC_RESP
	copy(msg[5:], buf.Bytes())
	return [][]byte{msg}
}

// Merge merges the other GossipData into this one,
// and returns our resulting, complete state.
func (st *SubTrie) Merge(osubs mesh.GossipData) (complete mesh.GossipData) {
	return
}

type SubMessage struct {
	TP       int
	Topic    []byte
	Cid      uint64
	UserName []byte
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
