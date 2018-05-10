package service

type Storer interface {
	Init()
	Put(*Message)
	Get([]byte, int, []byte) []*Message
	GetCount([]byte) int
	ACK([]byte)
	Flush()
	Sub([]byte, uint64)
	Unsub([]byte, uint64)
}
