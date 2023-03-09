package utils

import "github.com/golang/snappy"

func Compress(s string) []byte {
	encoded := snappy.Encode(nil, []byte(s))
	return encoded
}

func CompressBytes(s []byte) []byte {
	encoded := snappy.Encode(nil, s)
	return encoded
}

func Uncompress(b []byte) ([]byte, error) {
	return snappy.Decode(nil, b)
}
