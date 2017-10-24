package address

import (
	"github.com/magiconair/properties/assert"
	"testing"
	"fmt"
)

func TestEncode(t *testing.T) {
	assert.Equal(t, uint64(0x313233343536), encode([]byte("123456")))

	f:= Hardware()
	fmt.Println(f.String(), uint64(f))

	f2 := Fingerprint(uint64(0x313233343536))
	fmt.Println(f2.String(), uint64(f2))
}
