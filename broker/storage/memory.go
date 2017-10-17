package storage

// InMemory  a memory storage
type InMemory struct {
}

// Init init memory server
func (m *InMemory) Init() error {
	return nil
}

// Store store message
func (m *InMemory) Store(key string, value []byte, msgid string, ttl int64) error {
	return nil
}

// Get get message
func (m *InMemory) Get(key string, limit int) ([][]byte, error) {
	return nil, nil
}

// Del delete message
func (m *InMemory) Del(key string, msgid string) error {
	return nil
}

// Len counted quantity
func (m *InMemory) Len(key string) (int, error) {
	return 0, nil
}

// Name get store name
func (m *InMemory) Name() string {
	return "InMemory"
}
