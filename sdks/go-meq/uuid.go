package meq

import (
	"strconv"
	"time"

	"github.com/sunface/talent"
)

// 18byte
func GenMessageID() []byte {
	return talent.String2Bytes(strconv.FormatInt(time.Now().UnixNano(), 10))
}
