package storage

// MemoryStore  a memory storage
type MemoryStore struct {
	// cacheNum int
}

// Init init memory server
func (ms *MemoryStore) Init() error {
	return nil
}

// Store store message
func (ms *MemoryStore) Store(key string, value []byte, msgid string, ttl int64) error {
	return nil
}

// Get get message
func (ms *MemoryStore) Get(key string, limit int) ([][]byte, error) {
	return nil, nil
}

// Del delete message
func (ms *MemoryStore) Del(key string, msgid string) error {
	return nil
}

// Len counted quantity
func (ms *MemoryStore) Len(key string) (int, error) {
	return 0, nil
}

// Name get store name
func (ms *MemoryStore) Name() string {
	return "MemoryStore"
}
