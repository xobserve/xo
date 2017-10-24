package channel

import (
	"reflect"
	"strconv"
	"unsafe"
	"github.com/teamsaas/meq/common/gdata"
	"github.com/teamsaas/tools"
	"strings"
)

// Channel types
const (
	ChannelInvalid = uint8(iota)
	ChannelError

	ChannelSeparatorMax int = 3
)

// ChannelOption represents a key/value pair option.
type ChannelOption struct {
	Key   string
	Value string
}

// Channel represents a parsed MQTT topic.
type Channel struct {
	Key         []byte          // Gets or sets the API key of the channel.
	Channel     []byte          // Gets or sets the channel string.
	Query       []uint32        // Gets or sets the full ssid.
	Type        []byte          // Query Type
	Options     []ChannelOption // Gets or sets the options.
	ChannelType uint8
	ChannelNum  int
}

// TTL returns a Time-To-Live option
func (c *Channel) TTL() (uint32, bool) {
	return c.getOptUint("ttl")
}

// Last returns the 'last' option
func (c *Channel) Last() (uint32, bool) {
	return c.getOptUint("last")
}

// append user owner channel
func (c *Channel) AppnedUserChannel(username []byte) {
	length := len(c.Channel)
	newChanel :=make([]byte, length)
	copy(newChanel, c.Channel)
	var buf []byte
	for i := 0; i < length; i++ {
		symbol := newChanel[i]
		switch {
		case symbol == gdata.ChannelSeparator:
			buf = make([]byte, i+1+len(username))
			copy(buf[0:i], newChanel[0:i])
			buf[i] = gdata.ChannelSeparator
			copy(buf[i+1:], username)
			c.Query = append(c.Query, tools.GetHash(buf))
			c.Type = append(c.Type, gdata.TypeChannelPrivate)
			buf = buf[:0]
		case i+1 == length:
			buf = make([]byte, length+1+len(username))
			copy(buf[0:length], newChanel)
			buf[length] = gdata.ChannelSeparator
			copy(buf[length+1:], username)
			c.Query = append(c.Query, tools.GetHash(buf))
			c.Type = append(c.Type, gdata.TypeChannelPrivate)
			buf = buf[:0]
		default:
			continue
		}
	}
}

// getOptUint retrieves a Uint option
func (c *Channel) getOptUint(name string) (uint32, bool) {
	for i := 0; i < len(c.Options); i++ {
		if c.Options[i].Key == name {
			if val, err := strconv.ParseUint(c.Options[i].Value, 10, 32); err == nil {
				return uint32(val), true
			}
			return 0, false
		}
	}
	return 0, false
}

// ParseChannel2 attempts to parse the channel from the underlying slice.
func ParsePublishChannel(text []byte) (channel *Channel) {
	channel = new(Channel)
	channel.Query = make([]uint32, 0, 6)
	offset := 0

	// First we need to parse the key part
	i, ok := channel.parseKey(text)
	if !ok {
		channel.ChannelType = ChannelError
		return channel
	}

	// Now parse the channel
	offset += i
	channel.parseChannel(text[offset:])
	if len(channel.Query) > 1 {
		channel.Query = []uint32{channel.Query[len(channel.Query)-1]}
	}

	return channel
}

// ParseChannel2 attempts to parse the channel from the underlying slice.
func ParseChannel(text []byte) (channel *Channel) {
	channel = new(Channel)
	channel.Query = make([]uint32, 0, 6)
	channel.Type = make([]byte, 0, 6)

	// First we need to parse the key part
	i, ok := channel.parseKey(text)
	if !ok {
		channel.ChannelType = ChannelError
		return channel
	}

	ts := strings.Split(tools.Bytes2String(text[i:]), "?")

	o := channel.parseChannel([]byte(ts[0]))
	if !o {
		return channel
	}
	if channel.ChannelNum > ChannelSeparatorMax {
		channel.ChannelType = ChannelError
	}
	if len(ts) > 1 {
		channel.parseOptions([]byte(ts[1]))
	}

	return channel
}

// ParseKey reads the provided API key, this should be the 32-character long
// key or 'meq' string for custom API requests.
func (c *Channel) parseKey(text []byte) (i int, ok bool) {
	//keyChars := 0
	for ; i < len(text); i++ {
		if text[i] == gdata.ChannelSeparator {
			if c.Key = text[:i]; len(c.Key) > 0 {
				return i + 1, true
			}
			break
		}
	}
	return i, false
}

func (c *Channel) parseChannel(text []byte) (ok bool) {
	length := len(text)
	chanChars := 0
	for i := 0; i < length; i++ {
		symbol := text[i] // The current byte
		switch {
		// If we're reading a separator compute the SSID.
		case symbol == gdata.ChannelSeparator:
			if chanChars == 0 {
				return true
			}
			c.Query = append(c.Query, tools.GetHash(text[0:i]))
			c.Type = append(c.Type, gdata.TypeChannelPublic)
			c.Channel = text[0:i]
			c.ChannelNum++
			chanChars = 0
			continue
		case symbol == '+' || symbol == '*' || symbol == '=' || symbol == '@' || symbol == '?':
			if chanChars > 0 {
				c.Query = append(c.Query, tools.GetHash(text[0:i]))
				c.Type = append(c.Type, gdata.TypeChannelPublic)
				c.Channel = text[0:i]
				c.ChannelNum++
				return false
			} else {
				return false
			}
		case i+1 == length:
			c.Query = append(c.Query, tools.GetHash(text[0:length]))
			c.Type = append(c.Type, gdata.TypeChannelPublic)
			c.Channel = text[0:length]
			c.ChannelNum++
		case (symbol >= 45 && symbol <= 58) || (symbol >= 65 && symbol <= 122):
			chanChars++
			continue
		default:
			return true
		}
	}
	return true
}

// ParseOptions parses the key/value pairs of options, encoded as URL Query string.
func (c *Channel) parseOptions(text []byte) (i int, ok bool) {
	length := len(text)
	j := i

	// We need to create the options container, if we do have options
	c.Options = make([]ChannelOption, 0, 2)
	var key, val []byte

	//chanChars := 0

	// Start reading the options.
	for i < length {

		// Get the key
		for j < length {
			symbol := text[j] // The current byte
			j++

			if symbol == '=' {
				key = text[i: j-1]
				i = j
				break
			} else if !((symbol >= 48 && symbol <= 57) || (symbol >= 65 && symbol <= 90) || (symbol >= 97 && symbol <= 122)) {
				return i, false
			}
		}

		// Get the value
		for j < length {
			symbol := text[j]
			j++

			if symbol == '&' {
				val = text[i: j-1]
				i = j
				break
			} else if !((symbol >= 48 && symbol <= 57) || (symbol >= 65 && symbol <= 90) || (symbol >= 97 && symbol <= 122)) {
				return i, false
			} else if j == length {
				val = text[i:j]
				i = j
				// break ? and what about goto for perfs ?
			}
		}

		// By now we should have a key and a value, otherwise this is not a valid channel string.
		if len(key) == 0 || len(val) == 0 {
			return i, false
		}

		// Set the option
		c.Options = append(c.Options, ChannelOption{
			Key:   unsafeToString(key),
			Value: unsafeToString(val),
		})

		val = val[0:0]
		key = key[0:0]
	}

	return i, true
}

func unsafeToString(b []byte) string {
	bh := (*reflect.SliceHeader)(unsafe.Pointer(&b))
	sh := reflect.StringHeader{bh.Data, bh.Len}
	return *(*string)(unsafe.Pointer(&sh))
}
