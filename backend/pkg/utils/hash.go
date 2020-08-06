package utils

import "hash/fnv"

// HashS2UI64  string转uint64
func HashS2UI64(s string) uint64 {
	h := fnv.New64()
	h.Write(String2Bytes(s))
	return h.Sum64()
}

// HashS2UI32  string转uint32
func HashS2UI32(s string) uint32 {
	h := fnv.New32a()
	h.Write(String2Bytes(s))
	return h.Sum32()
}
