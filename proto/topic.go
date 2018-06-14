package proto

import (
	"errors"

	"github.com/sunface/talent"
)

/* A topic must be like these
1. /APP_ID/SEND_TAG/a
2. /APP_ID/SEND_TAG/a/+
3. /APP_ID/SEND_TAG/a/+/b...
APP_ID must have the length of AppIdLen, SEND_TAG must be TopicSendOne or TopicSendAll
*/

// DONT change these values!
const (
	TopicSep      = '/'
	TopicWildcard = '+'

	TopicSendOne = '1'
	TopicSendAll = '2'

	TopicTypeNormal = '1'
	TopicTypeChat   = '2'

	AppIdLen = 10
)

var (
	WildCardHash = talent.MurMurHash([]byte{TopicWildcard})
)

func ParseTopic(t []byte, exactly bool) ([]uint32, error) {
	var tids []uint32
	var err error

	if len(t) == 0 {
		err = errors.New("topic cant be empty")
		return nil, err
	}

	var buf []byte
	for i, b := range t {
		if i == 0 { // first byte must be topic sep
			if b != TopicSep {
				err = errors.New("topic invalid1")
				return nil, err
			}
			continue
		}
		if i == len(t)-1 { // last byte must not be topic sep
			if b == TopicSep {
				err = errors.New("topic invalid2")
				return nil, err
			}
		}
		if b != TopicSep {
			buf = append(buf, b)
			continue
		}

		if len(buf) == 0 {
			err = errors.New("topic invalid3")
			return nil, err
		}
		tid := talent.MurMurHash(buf)
		tids = append(tids, tid)
		buf = buf[:0]
	}

	if len(buf) != 0 {
		tid := talent.MurMurHash(buf)
		tids = append(tids, tid)
	}

	if len(tids) < 3 {
		return nil, errors.New("topic invalid4")
	}

	// first three parts of topic cant be wildcard
	if tids[0] == WildCardHash || tids[1] == WildCardHash || tids[2] == WildCardHash {
		return nil, errors.New("first three parts cant be wildcard")
	}

	// a exactly topic cant contain wildcard char
	if exactly {
		// if the topic is for subscribe,every part of topic cant be wildcard
		for _, tid := range tids[2:] {
			if tid == WildCardHash {
				return nil, errors.New("subscribe topic  cant contain wildcard")
			}
		}
	}

	return tids, nil
}

func AppidAndSendTag(topic []byte) ([]byte, byte, byte, error) {
	i2 := 0
	i3 := 0

	for i, b := range topic {
		if i == 0 {
			// first byte must be topic sep
			if b != TopicSep {
				return nil, 0, 0, errors.New("topic invalid5")
			}
			continue
		}
		if i != 0 && b == TopicSep && i2 == 0 {
			i2 = i
			continue
		}
		if b == TopicSep {
			i3 = i
			break
		}
	}

	// last byte cant be topic sep
	if i3 == len(topic)-1 {
		return nil, 0, 0, errors.New("topic invalid6")
	}

	// sendtag's length must be 2
	if i3 != i2+3 {
		return nil, 0, 0, errors.New("topic invalid7")
	}

	// appid's length must be AppIdLen
	appid := topic[1:i2]
	if len(appid) != AppIdLen {
		return nil, 0, 0, errors.New("topic invalid8")
	}

	sendtag := topic[i2+1]
	if sendtag != TopicSendOne && sendtag != TopicSendAll {
		return nil, 0, 0, errors.New("topic invalid9")
	}

	typetag := topic[i2+2]
	if sendtag != TopicTypeNormal && sendtag != TopicTypeChat {
		return nil, 0, 0, errors.New("topic invalid9")
	}
	return appid, sendtag, typetag, nil
}

func GetTopicType(topic []byte) byte {
	return topic[13]
}
