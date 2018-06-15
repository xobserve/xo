package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenMessageID(t *testing.T) {
	b1 := NewBroker("../broker.yaml")
	StartIDGenerator(b1)

	b2 := NewBroker("../broker.yaml")
	b2.conf.Broker.ServerID = 2
	StartIDGenerator(b2)
	id1 := b1.idgen.Generate().Int64()
	id2 := b1.idgen.Generate().Int64()

	assert.NotEqual(t, id1, id2)

	id3 := b1.idgen.Generate().Int64()
	id4 := b2.idgen.Generate().Int64()
	assert.NotEqual(t, id3, id4)
}

func BenchmarkGenMessageID(b *testing.B) {
	bk := NewBroker("../broker.yaml")
	StartIDGenerator(bk)

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		bk.idgen.Generate().Int64()
	}
}
