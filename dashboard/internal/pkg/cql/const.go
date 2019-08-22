package cql

const (
	// ConnectTimeout specify the timeout interval for connecting to cassandra
	ConnectTimeout = 30
	// ReconnectInterval specify the reconnect interval for connecting to cassandra
	ReconnectInterval = 500
	// StaticKeySpace is the tag for static cql keyspace
	StaticKeySpace = 0
	// DynamicKeySpace is the tag for static cql keyspace
	DynamicKeySpace = 1
)
