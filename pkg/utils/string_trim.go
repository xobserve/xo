package utils

import (
	"bytes"
	"strings"
)

// TrimStringExtraLineAndSpace trims extra space and line break, convert tab to space
func TrimStringExtraLineAndSpace(s string) string {
	var last rune
	return strings.Map(func(r rune) rune {
		// tab -> space
		if r == 9 {
			last = 32
			return 32
		}
		// \n + \n -> \n
		if r == 10 {
			return 0
		}
		if r == 13 {
			return 0
		}

		// space + space -> space
		if r == 32 && last == 32 {
			return 0
		}
		last = r
		return r
	}, s)
}

// TrimBytesExtraLineAndSpace trims extra space and line break, convert tab to space
func TrimBytesExtraLineAndSpace(s []byte) []byte {
	var last rune
	return bytes.Map(func(r rune) rune {
		// tab -> space
		if r == 9 {
			last = 32
			return 32
		}
		// \n + \n -> \n
		if r == 10 {
			return 0
		}
		if r == 13 {
			return 0
		}

		// space + space -> space
		if r == 32 && last == 32 {
			return 0
		}
		last = r
		return r
	}, s)
}
