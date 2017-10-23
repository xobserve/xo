package channel

import (
	"testing"
	"github.com/magiconair/properties/assert"
	"fmt"
)

func TestParseChannel2(t *testing.T) {
	var s = []string{
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/a/b",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/a",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/aba/ss",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/aba?ss",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/aba/va=ss",
		"xxx/abc/channel",
		"xxx/abc///",
		"xxx/abc/+a",
		"xxx/abc/aac/a",
		"xxx/aa//",
		"xxx/",
		"xxx/+",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/emitter-demo/ww/?last=10",
	}
	for index, s0 := range s {
		out := ParseChannel2([]byte(s0))
		if index == 0 {
			assert.Equal(t, string(out.Key), "0TJnt4yZPL73zt35h1UTIFsYBLetyD_g")
			assert.Equal(t, string(out.Channel), "a/b")
		}else if index == 1 {
			assert.Equal(t, string(out.Key), "0TJnt4yZPL73zt35h1UTIFsYBLetyD_g")
			assert.Equal(t, string(out.Channel), "a")
		}else if index == 2 {
			assert.Equal(t, string(out.Key), "0TJnt4yZPL73zt35h1UTIFsYBLetyD_g")
			assert.Equal(t, string(out.Channel), "aba/ss")
		}else if index == 3 {
			assert.Equal(t, string(out.Key), "0TJnt4yZPL73zt35h1UTIFsYBLetyD_g")
			assert.Equal(t, string(out.Channel), "aba")
		}else if index == 4 {
			assert.Equal(t, string(out.Key), "0TJnt4yZPL73zt35h1UTIFsYBLetyD_g")
			assert.Equal(t, string(out.Channel), "aba/va")
		}else if index == 5 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "abc/channel")
		}else if index == 6 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "abc")
		}else if index == 7 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "abc")
		}else if index == 8 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "abc/aac/a")
		}else if index == 9 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "aa")
		}else if index == 10 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "")
		}else if index == 11 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "")
		}
		fmt.Println(index, string(out.Key), string(out.Channel))
	}
}