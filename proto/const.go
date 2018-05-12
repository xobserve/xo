package proto

const (
	MSG_PUB        = 'a'
	MSG_SUB        = 'b'
	MSG_PUBACK     = 'c'
	MSG_PING       = 'd'
	MSG_PONG       = 'e'
	MSG_UNSUB      = 'f'
	MSG_COUNT      = 'g'
	MSG_PULL       = 'h'
	MSG_CONNECT    = 'i'
	MSG_CONNECT_OK = 'j'
	MSG_PUB_TIMER  = 'k'
)

const (
	NORMAL_MSG = 0
	TIMER_MSG  = 1
)

var (
	DEFAULT_GROUP = []byte("meq.io")
)
