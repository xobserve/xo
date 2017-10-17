package storage

// Storage storage
type Storage interface {
	Init() error                                                   // init storage server
	Store(key string, value []byte, msgid string, ttl int64) error // insert message
	Get(key string, limit int) ([][]byte, error)                   // get message
	Del(key string, msgid string) error                            // delete message
	Name() string
}
