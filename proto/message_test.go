package proto

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

var mockMsgs = []*PubMsg{
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world1"), false, 0, 1, 100, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world2"), false, 0, 1, 101, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world3"), false, 0, 1, 102, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world4"), true, 0, 1, 100, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world5"), false, 0, 1, 100, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world6"), false, 0, 1, 100, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world7"), false, 0, 1, 100, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world8"), false, 0, 1, 100, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world9"), true, 0, 1, 100, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world10"), false, 0, 1, 100, []byte("sunface")},
	&PubMsg{[]byte("123"), []byte(""), []byte("test"), []byte("hello world11"), false, 0, 1, 100, []byte("sunface")},
}

var mockMsgs1 = []*PubMsg{
	&PubMsg{
		ID:      []byte(""),
		Topic:   []byte("test"),
		Payload: []byte("hello world1"),
		TTL:     100,
	},
	&PubMsg{
		ID:      []byte(""),
		Topic:   []byte("test"),
		Payload: []byte("hello world1"),
		TTL:     100,
	},
}

func TestPubMsgOnePackUnpack(t *testing.T) {
	packed := PackMsg(mockMsgs1[0])
	unpacked, err := UnpackMsg(packed[1:])

	assert.NoError(t, err)
	assert.Equal(t, mockMsgs1[0], unpacked)
}

func TestPubMsgsPackUnpack(t *testing.T) {
	packed := PackPubBatch(mockMsgs1, MSG_PUB_BATCH)
	unpacked, err := UnpackPubBatch(packed[1:])

	assert.NoError(t, err)
	assert.Equal(t, mockMsgs1, unpacked)
}

func TestSubPackUnpack(t *testing.T) {
	topic := []byte("test")

	packed := PackSub(topic)
	ntopic := UnpackSub(packed[5:])

	assert.Equal(t, topic, ntopic)

}

func TestMarkReadPackUnpack(t *testing.T) {
	topic := []byte("/1234567890/1/test/a")
	var msgids [][]byte
	for _, m := range mockMsgs {
		msgids = append(msgids, m.ID)
	}

	packed := PackMarkRead(topic, msgids)
	utopic, umsgids := UnpackMarkRead(packed[1:])

	assert.Equal(t, msgids, umsgids)
	assert.Equal(t, topic, utopic)
}

func TestMsgCountPackUnpack(t *testing.T) {
	count := 10923

	packed := PackMsgCount(count)
	ncount := UnpackMsgCount(packed[1:])

	assert.Equal(t, count, ncount)
}

func TestPullPackUnpack(t *testing.T) {
	msgid := []byte("00001")
	count := 11123

	packed := PackPullMsg(count, msgid)
	ncount, nmsgid := UnPackPullMsg(packed[1:])

	assert.Equal(t, count, ncount)
	assert.Equal(t, msgid, nmsgid)
}

func TestTimerMsgPackUnpack(t *testing.T) {
	tmsg := &TimerMsg{[]byte("0001"), []byte("test"), []byte("timer msg emit!"), time.Now().Unix(), 10}
	packed := PackTimerMsg(tmsg, MSG_PUB_TIMER)
	unpacked := UnpackTimerMsg(packed[5:])

	assert.Equal(t, tmsg, unpacked)
}

func TestSubAckPackUnpack(t *testing.T) {
	tp := []byte("test")
	packed := PackSubAck(tp)
	unpacked := UnpackSubAck(packed[5:])

	assert.Equal(t, tp, unpacked)
}

func TestPackAckCount(t *testing.T) {
	count := MAX_PULL_COUNT

	packed := PackReduceCount(count)
	ucount := UnpackReduceCount(packed[1:])

	assert.Equal(t, count, ucount)

	count = REDUCE_ALL_COUNT

	packed = PackReduceCount(count)
	ucount = UnpackReduceCount(packed[1:])

	assert.Equal(t, count, ucount)
}

func TestPackPresenceUsers(t *testing.T) {
	users := [][]byte{[]byte("a1"), []byte("a2"), []byte("a3")}
	packed := PackPresenceUsers(users, MSG_PRESENCE_ALL)
	ousers := UnpackPresenceUsers(packed[1:])

	assert.EqualValues(t, users, ousers)
}

func TestPackJoinChat(t *testing.T) {
	topic := []byte("/1234567890/12/test/a")
	packet := PackJoinChat(topic)
	utopic := UnpackJoinChat(packet[1:])

	assert.Equal(t, topic, utopic)
}

func TestPackLeaveChat(t *testing.T) {
	topic := []byte("/1234567890/12/test/a")
	packet := PackLeaveChat(topic)
	utopic := UnpackLeaveChat(packet[1:])

	assert.Equal(t, topic, utopic)
}

func TestPackJoinChatNotify(t *testing.T) {
	topic := []byte("/1234567890/12/test/a")
	user := []byte("sunface")

	packet := PackJoinChatNotify(topic, user)
	utopic, uuser := UnpackJoinChatNotify(packet[1:])

	assert.Equal(t, topic, utopic)
	assert.Equal(t, user, uuser)
}

func TestPackOnlineNotify(t *testing.T) {
	topic := []byte("/1234567890/12/test/a")
	user := []byte("sunface")

	packet := PackOnlineNotify(topic, user)
	utopic, uuser := UnpackOnlineNotify(packet[1:])

	assert.Equal(t, topic, utopic)
	assert.Equal(t, user, uuser)
}

func TestPackOfflineNotify(t *testing.T) {
	topic := []byte("/1234567890/12/test/a")
	user := []byte("sunface")

	packet := PackOfflineNotify(topic, user)
	utopic, uuser := UnpackOfflineNotify(packet[1:])

	assert.Equal(t, topic, utopic)
	assert.Equal(t, user, uuser)
}

func TestPackRetrieve(t *testing.T) {
	topic := []byte("1234")
	msgid := []byte("sunface")

	packed := PackRetrieve(topic, msgid)
	utopic, umsgid := UnpackRetrieve(packed[1:])

	assert.Equal(t, topic, utopic)
	assert.Equal(t, msgid, umsgid)
}
func BenchmarkPubMsgPack(b *testing.B) {
	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		PackPubBatch(mockMsgs, MSG_PUB_BATCH)
	}
}

func BenchmarkPubMsgUnpack(b *testing.B) {
	b.ReportAllocs()
	b.ResetTimer()

	packed := PackPubBatch(mockMsgs, MSG_PUB_BATCH)
	for i := 0; i < b.N; i++ {
		UnpackPubBatch(packed[5:])
	}
}
