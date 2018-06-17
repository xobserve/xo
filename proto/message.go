package proto

type PubMsg struct {
	RawID   []byte
	ID      []byte
	Topic   []byte
	Payload []byte
	Acked   bool
	Type    int8
	QoS     int8
	TTL     int64
	Sender  []byte
}

type TimerMsg struct {
	ID      []byte
	Topic   []byte
	Payload []byte
	Trigger int64
	Delay   int
}

type Ack struct {
	Topic []byte
	Msgid []byte
}
