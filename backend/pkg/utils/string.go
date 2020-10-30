package utils

import (
	"bytes"
	"crypto/md5"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"unsafe"
)

//生成随机字符串
func RandString() string {
	b := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}

func MD5(str string) string {
	w := md5.New()
	io.WriteString(w, str)
	md5str := fmt.Sprintf("%x", w.Sum(nil))
	return md5str
}

// zero-copy, []byte转为string类型
// 注意，这种做法下，一旦[]byte变化，string也会变化
// 谨慎，黑科技！！除非性能瓶颈，否则请使用string(b)1

func Bytes2String(b []byte) (s string) {
	return *(*string)(unsafe.Pointer(&b))
	// pb := (*reflect.SliceHeader)(unsafe.Pointer(&b))
	// ps := (*reflect.StringHeader)(unsafe.Pointer(&s))
	// ps.Data = pb.Data
	// ps.Len = pb.Len
	// return
}

// zero-coy, string类型转为[]byte
// 注意，这种做法下，一旦string变化，程序立马崩溃且不能recover
// 谨慎，黑科技！！除非性能瓶颈，否则请使用[]byte(s)
func String2Bytes(s string) (b []byte) {
	return *(*[]byte)(unsafe.Pointer(&s))
	// pb := (*reflect.SliceHeader)(unsafe.Pointer(&b))
	// ps := (*reflect.StringHeader)(unsafe.Pointer(&s))
	// pb.Data = ps.Data
	// pb.Len = ps.Len
	// pb.Cap = ps.Len
	// return
}

func Any(value interface{}) string {
	return FormatAtom(reflect.ValueOf(value))
}

func FormatAtom(v reflect.Value) string {
	switch v.Kind() {
	case reflect.Invalid:
		return "invalid"
	case reflect.Int, reflect.Int8, reflect.Int16,
		reflect.Int32, reflect.Int64:
		return strconv.FormatInt(v.Int(), 10)
	case reflect.Uint, reflect.Uint8, reflect.Uint16,
		reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return strconv.FormatUint(v.Uint(), 10)
	case reflect.Float32, reflect.Float64:
		return strconv.FormatFloat(v.Float(), 'f', 5, 64)
	case reflect.Bool:
		return strconv.FormatBool(v.Bool())
	case reflect.String:
		return strconv.Quote(v.String())
	case reflect.Chan, reflect.Func, reflect.Ptr, reflect.Slice, reflect.Map:
		return v.Type().String() + " 0x" +
			strconv.FormatUint(uint64(v.Pointer()), 16)
	default:
		return v.Type().String() + " value"

	}
}

// 如果是连续的换行，则只保留一个换行
// 如果是tab，则替换为空格
// 如果是连续的空格，则只保留一个空格
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

// SplitString splits a string by commas or empty spaces.
func SplitString(str string) []string {
	if len(str) == 0 {
		return []string{}
	}

	return regexp.MustCompile("[, ]+").Split(str, -1)
}
