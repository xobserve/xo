package service

import "time"

const (
	// ACCEPT_MIN_SLEEP is the minimum acceptable sleep times on temporary errors.
	ACCEPT_MIN_SLEEP = 10 * time.Millisecond
	// ACCEPT_MAX_SLEEP is the maximum acceptable sleep times on temporary errors
	ACCEPT_MAX_SLEEP = 1 * time.Second

	MAX_IDLE_TIME = 60 * time.Second

	WRITE_DEADLINE = 1 * time.Second
)

var (
	MSG_PUSH_PREFIX = []byte("mp")
	IM_PREFIX       = []byte("im")
	MQ_PREFIX       = []byte("mq")

	MSG_NEWEST_OFFSET = []byte("0")
)
