package collection

import (
	"bytes"
	"sync"
)

// BufferPool represents a thread safe buffer pool
type BufferPool struct {
	sync.Pool
}

// NewBufferPool creates a new BufferPool bounded to the given size.
func NewBufferPool(bufferSize int) (bp *BufferPool) {
	return &BufferPool{
		sync.Pool{
			New: func() interface{} {
				return bytes.NewBuffer(make([]byte, 0, bufferSize))
			},
		},
	}
}

// Get gets a Buffer from the SizedBufferPool, or creates a new one if none are
// available in the pool. Buffers have a pre-allocated capacity.
func (bp *BufferPool) Get() *bytes.Buffer {
	return bp.Pool.Get().(*bytes.Buffer)
}

// Put returns the given Buffer to the SizedBufferPool.
func (bp *BufferPool) Put(b *bytes.Buffer) {
	b.Reset()
	bp.Pool.Put(b)
}
