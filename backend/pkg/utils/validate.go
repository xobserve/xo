package utils

import (
	"regexp"
)

func OnlyAlpha(s string) bool {
	for _, r := range s {
		if !((r >= 65 && r <= 90) || (r >= 97 && r <= 122)) {
			return false
		}
	}

	return true
}

// 检查字符串是否由中文、英文、数字组成
func OnlyAlphaAndNum(s string) bool {
	for _, r := range s {
		if !((r >= 65 && r <= 90) || (r >= 97 && r <= 122)) && !(r >= 48 && r <= 57) {
			return false
		}
	}

	return true
}

// 字符串只允许英文字母和中划线
func OnlyAlphaAndMinus(s string) bool {
	for _, r := range s {
		if !((r >= 65 && r <= 90) || (r >= 97 && r <= 122)) && !(r == 45) {
			return false
		}
	}

	return true
}

func OnlyAlphaNumAndDot(s string) bool {
	for _, r := range s {
		if !((r >= 65 && r <= 90) || (r >= 97 && r <= 122)) && !(r >= 48 && r <= 57) && !(r == 46) {
			return false
		}
	}

	return true
}

func OnlyAlphaNumAndUri(s string) bool {
	// 首字符必须/开头
	if s[0] != '/' {
		return false
	}
	// 最后一个字符必须不能为/
	if s[len(s)-4] == '/' {

		return false
	}
	for _, r := range s {
		if !((r >= 65 && r <= 90) || (r >= 97 && r <= 122)) && !(r >= 48 && r <= 57) && !(r == 47) && !(r == 46) {
			return false
		}
	}

	return true
}

/************************* 自定义类型 ************************/
//数字+字母  不限制大小写 6~30位
func IsID(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^[0-9a-zA-Z]{6,30}$", s)
		if false == b {
			return b
		}
	}
	return b
}

//数字+字母+符号 6~30位
func IsPwd(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^[0-9a-zA-Z@.]{6,30}$", s)
		if false == b {
			return b
		}
	}
	return b
}

/************************* 数字类型 ************************/
//纯整数
func IsInteger(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^[0-9]+$", s)
		if false == b {
			return b
		}
	}
	return b
}

//纯小数
func IsDecimals(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^\\d+\\.[0-9]+$", s)
		if false == b {
			return b
		}
	}
	return b
}

//手提电话（不带前缀）最高11位
func IsCellphone(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^1[0-9]{10}$", s)
		if false == b {
			return b
		}
	}
	return b
}

//家用电话（不带前缀） 最高8位
func IsTelephone(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^[0-9]{8}$", s)
		if false == b {
			return b
		}
	}
	return b
}

/************************* 英文类型 *************************/
//仅小写
func IsEngishLowCase(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^[a-z]+$", s)
		if false == b {
			return b
		}
	}
	return b
}

//仅大写
func IsEnglishCap(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^[A-Z]+$", s)
		if false == b {
			return b
		}
	}
	return b
}

//大小写混合
func IsEnglish(str ...string) bool {
	var b bool
	for _, s := range str {
		b, _ = regexp.MatchString("^[A-Za-z]+$", s)
		if false == b {
			return b
		}
	}
	return b
}

//邮箱 最高30位
func IsEmail(s string) (bool, error) {
	return regexp.MatchString("^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$", s)
}

//IP
func IsIP(s string) bool {
	m, _ := regexp.MatchString(`(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d).(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d).(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d).(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)`, s)
	return m
}

//HTTP URL
func IsURL(s string) bool {
	m, _ := regexp.MatchString(`^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+`, s)
	return m
}
