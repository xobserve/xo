package proto

type Message struct {
	ID      []byte
	Topic   []byte
	Payload []byte
	Acked   bool
	Type    int8
}

type TimerMsg struct {
	ID      []byte
	Topic   []byte
	Payload []byte
	Delay   int
	Count   int8
	Base    int8
	Power   int8
}
