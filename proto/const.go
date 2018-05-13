package proto

const (
	MSG_PUB           = 'a'
	MSG_SUB           = 'b'
	MSG_PUBACK        = 'c'
	MSG_PING          = 'd'
	MSG_PONG          = 'e'
	MSG_UNSUB         = 'f'
	MSG_COUNT         = 'g'
	MSG_PULL          = 'h'
	MSG_CONNECT       = 'i'
	MSG_CONNECT_OK    = 'j'
	MSG_PUB_TIMER     = 'k'
	MSG_PUB_TIMER_ACK = 'l'
	MSG_PUB_RESTORE   = 'm'
)

const (
	NORMAL_MSG = 0
	TIMER_MSG  = 1
)

const (
	QOS0 = 0
	QOS1 = 1
)

var (
	DEFAULT_GROUP = []byte("meq.io")
)
