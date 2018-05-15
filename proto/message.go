package proto

type Message struct {
	ID      []byte
	Topic   []byte
	Payload []byte
	Acked   bool
	Type    int8
	QoS     int8
}

type TimerMsg struct {
	ID      []byte
	Topic   []byte
	Payload []byte
	Trigger int64
	Delay   int
}
