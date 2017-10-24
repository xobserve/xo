package channel

import (
	"testing"
	"fmt"
	"github.com/magiconair/properties/assert"
)

func TestParseChannel(t *testing.T) {
	var s = []string{
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/a/b",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/a",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/aba/ss",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/aba?ss",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/aba/va=ss",
		"xxx/abc/channel",
		"xxx/abc///",
		"xxx/abc/axs+a",
		"xxx/abc/aac/+a",
		"xxx/a/b/c/111/22",
		"xxx/",
		"xxx/+",
		"0TJnt4yZPL73zt35h1UTIFsYBLetyD_g/meq-demo/ww/?last=10&tls=22",
		"DEX0FiXfhjHUDlbnkyW2J5ZPhYfZ6rgE/emitter-demo/?last=10",
	}
	for index, s0 := range s {
		out := ParseChannel([]byte(s0))
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
			assert.Equal(t, string(out.Channel), "abc/axs")
		}else if index == 8 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "abc/aac")
		}else if index == 9 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "a/b/c/111/22")
			assert.Equal(t, out.ChannelType, uint8(1))
		}else if index == 10 {
			assert.Equal(t, string(out.Key), "xxx")
			assert.Equal(t, string(out.Channel), "")
		}else if index == 12 {
			assert.Equal(t, string(out.Key), "0TJnt4yZPL73zt35h1UTIFsYBLetyD_g")
			assert.Equal(t, string(out.Channel), "meq-demo/ww")
		}else if index == 13 {
			assert.Equal(t, string(out.Key), "DEX0FiXfhjHUDlbnkyW2J5ZPhYfZ6rgE")
			assert.Equal(t, string(out.Channel), "emitter-demo")
		}
		out.AppnedUserChannel([]byte("wt"))
		fmt.Println(index,out.Query, string(out.Channel), out.Type)

	}
}
