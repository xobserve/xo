package utils

import "unsafe"

// Bytes2String can convert string to bytes
// zero-copy
// Dont modify b anywhere !!
func Bytes2String(b []byte) (s string) {
	return *(*string)(unsafe.Pointer(&b))
}

// String2Bytes can convert bytes to string
// zero-copy
// Dont modify s anywhere !!
func String2Bytes(s string) (b []byte) {
	return *(*[]byte)(unsafe.Pointer(&s))
}
