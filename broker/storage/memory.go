package storage

import "sync"

// Memory memory cache
type Memory struct {
	ssidStore  sync.Map // ssid store
	topicStore sync.Map // topic store
}

type topicStore struct {
	// 消息列表 queue  有序
	// 已发送列表 map
	// Ack列表 map
	msgStore sync.Map // message store
}

type ssidStore struct {
	msgidStore sync.Map // received message cache, key is topic , value map[msgid]status
}

type msgMsg struct {
	ttl        int64
	insertTime int64
	value      []byte
}
