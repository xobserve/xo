package main

import (
	"fmt"
	"time"

	"github.com/cosmos-gg/meq/proto"
	meq "github.com/cosmos-gg/meq/sdks/go-meq"
)

func sub(conn *meq.Connection) {
	conn.OnMessage(func(msg *proto.PubMsg) {
		fmt.Println("recv msg:", string(msg.ID), string(msg.Topic), string(msg.Payload))
	})
	conn.OnUnread(func(topic []byte, count int) {
		fmt.Println("未读消息数量：", string(topic), count)
	})

	err := conn.Subscribe([]byte(topic))

	if err != nil {
		panic(err)
	}

	err = conn.ReduceCount([]byte(topic), proto.MAX_PULL_COUNT)
	if err != nil {
		fmt.Println(err)
	}

	// 先拉取x条消息
	err = conn.PullMsgs([]byte(topic), proto.MAX_PULL_COUNT, proto.MSG_NEWEST_OFFSET)
	if err != nil {
		fmt.Println(err)
	}

	// 加入聊天
	conn.JoinChat([]byte(topic))

	time.Sleep(5 * time.Second)
	// 离开聊天
	// conn.LeaveChat([]byte(topic))
	select {}
	// fmt.Println("累积消费未ACK消息数：", n1)
}
