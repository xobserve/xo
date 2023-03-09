package utils

import "time"

//将"2016-02-15" 格式转化为 time.Time
func DateStringToTime(s string) (time.Time, error) {
	loc, _ := time.LoadLocation("Local")
	t, err := time.ParseInLocation("2006-1-2", s, loc)
	return t, err
}

func Time2String(t time.Time) string {
	return t.Format("01-02 15:04")
}

func Time2String1(t time.Time) string {
	return t.Format("01-02")
}
