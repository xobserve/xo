package database

import (
	"time"

	"github.com/gocql/gocql"
)

// ConnectCQL connect to cassandra/scyllaDB cluster
func ConnectCQL(n int, timeout int, keyspace string, addrs []string) (*gocql.Session, error) {
	cluster := gocql.NewCluster(addrs...)
	cluster.Keyspace = keyspace
	cluster.NumConns = n
	cluster.Timeout = time.Duration(timeout) * time.Second

	session, err := cluster.CreateSession()
	if err != nil {
		return nil, err
	}

	return session, nil
}
