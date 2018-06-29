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
	"github.com/meqio/meq/proto"
)

type Storage interface {
	Init()
	Close()

	Store(msgs []*proto.PubMsg)

	UnreadCount(topic []byte, user []byte) int
	MarkRead(topic []byte, msgids [][]byte)
	UpdateUnreadCount(topic []byte, user []byte, isAdd bool, count int)
	Del(topic []byte, msgid []byte) error
	Query(topic []byte, count int, offset []byte, acked bool) []*proto.PubMsg

	StoreTM(*proto.TimerMsg)
	QueryTM() []*proto.PubMsg

	JoinChat(topic []byte, user []byte) error
	LeaveChat(topic []byte, user []byte) error
	GetChatUsers(topic []byte) [][]byte

	SaveAdminInfo(tp int, data interface{})
	QueryAdminInfo(tp int) interface{}
}
