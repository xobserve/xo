package service

import (
	"testing"
	"time"
)

func TestPubAndSubOnline(t *testing.T) {
	// start the two nodes in cluster
	// first node
	go testServer("8901", "00:00:00:00:00:01", "8911", "", "localhost:8921")
	go testServer("8902", "00:00:00:00:00:02", "8912", "localhost:8911", "localhost:8922")

	// give some starup time to the two nodes
	time.Sleep(2 * time.Second)

	// sub to the second node

	// pub to the first node

}

func TestClusterPubAndSub(t *testing.T) {

}

func testServer(bport string, chaddr string, cport string, cseed string, adminAddr string) {

}
