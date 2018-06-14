package service

import (
	"encoding/base64"
	"sync"
	"time"
)

const (
	// ACCEPT_MIN_SLEEP is the minimum acceptable sleep times on temporary errors.
	ACCEPT_MIN_SLEEP = 10 * time.Millisecond
	// ACCEPT_MAX_SLEEP is the maximum acceptable sleep times on temporary errors
	ACCEPT_MAX_SLEEP = 1 * time.Second

	WRITE_DEADLINE = 2 * time.Second

	MAX_MESSAGE_BATCH      = 200
	MAX_MESSAGE_PULL_COUNT = 200

	MAX_CHANNEL_LEN = 1000
)

const (
	CLUSTER_SUB              = 1
	CLUSTER_UNSUB            = 2
	CLUSTER_RUNNING_TIME_REQ = 3

	CLUSTER_RUNNING_TIME_RESP = 'a'
	CLUSTER_MSG_ROUTE         = 'b'
	CLUSTER_SUBS_SYNC_REQ     = 'c'
	CLUSTER_SUBS_SYNC_RESP    = 'd'
)

var glock = &sync.RWMutex{}
var b64 = base64.NewEncoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")
