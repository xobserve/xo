package service

import "encoding/binary"

func (cli *client) parsePub(buf []byte) ([]byte, []byte, []byte) {
	// read topic length
	var tl, pl, ml uint64
	if tl, _ = binary.Uvarint(buf[1:3]); tl <= 0 {
		return nil, nil, nil
	}

	if buf[5] != '-' {
		return nil, nil, nil
	}

	//  read payload length
	if pl, _ = binary.Uvarint(buf[3+tl : 7+tl]); pl <= 0 {
		return nil, nil, nil
	}

	// read msgid length
	if ml, _ = binary.Uvarint(buf[7+tl+pl : 8+tl+pl]); ml <= 0 {
		return nil, nil, nil
	}
	return buf[3 : 3+tl], buf[7+tl : 7+tl+pl], buf[8+tl+pl : 8+tl+pl+ml]
}

func (c *client) parseSub(buf []byte) []byte {
	// read topic length
	var tl uint64
	if tl, _ = binary.Uvarint(buf[1:3]); tl <= 0 {
		return nil
	}

	if buf[5] != '-' {
		return nil
	}

	return buf[3 : 3+tl]
}

func (c *client) parseAck(buf []byte) []byte {
	return buf[1:]
}

func (c *client) parsePull(buf []byte) ([]byte, int, []byte) {
	// read topic length
	var tl uint64
	if tl, _ = binary.Uvarint(buf[1:3]); tl <= 0 {
		return nil, 0, nil
	}

	count, _ := binary.Uvarint(buf[3+tl : 4+tl])
	return buf[3 : 3+tl], int(count), buf[4+tl:]
}
