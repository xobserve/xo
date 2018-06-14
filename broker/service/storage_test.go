package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStoreMsgPackUnpack(t *testing.T) {
	packed := PackStoreMessage(mockMsgs[0])
	unpacked := UnpackStoreMessage(packed)

	assert.Equal(t, mockMsgs[0], unpacked)
}
