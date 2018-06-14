package meq

import "github.com/cosmos-gg/meq/proto"

type PubMsgHandler func(*proto.PubMsg)
type UnreadHandler func([]byte, int)

func (c *Connection) OnMessage(h PubMsgHandler) {
	c.pubmsgh = h
}

func (c *Connection) OnUnread(h UnreadHandler) {
	c.unreadh = h
}
