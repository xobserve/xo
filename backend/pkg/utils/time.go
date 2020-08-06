package utils

import (
	"errors"
	"time"
	"math"
	"fmt"
)

func Time2String(t time.Time) string {
	return t.Format("2006-01-02 15:04:05.999")
}

func Time2StringSecond(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}
func Time2StringMinute(t time.Time) string {
	return t.Format("06-01-02 15:04")
}

func Time2Version(t time.Time) string {
	return t.Format("060102.150405")
}

//将"2016-02-15 12:00:00"或者"2016-04-18 09:33:56.694"等格式转化为time.Time
func StringToTime(s string) (time.Time, error) {
	loc, _ := time.LoadLocation("Local")
	t, err := time.ParseInLocation("2006-1-2 15:04:05", s, loc)
	return t, err
}

//将"2016-04-22T21:47:49.694123232+08:00"或者"2016-04-22T21:47:49+08:00"等格式转化为time.Time
func StringToTime1(s string) (time.Time, error) {
	loc, _ := time.LoadLocation("Local")
	t, err := time.ParseInLocation("2006-01-02T15:04:05+08:00", s, loc)
	return t, err
}

func StringToTime2(s string) (time.Time, error) {
	loc, _ := time.LoadLocation("Local")
	t, err := time.ParseInLocation("2006-01-02 15:04", s, loc)
	return t, err
}

func NSToTime(ns int64) (time.Time, error) {
	if ns <= 0 {
		return time.Time{}, errors.New("ns is err")
	}
	sec := ns / 1e9
	nsec := ns - sec*1e9
	return time.Unix(sec, nsec), nil
}

func MSToTime(ms int64) (time.Time, error) {
	if ms <= 0 {
		return time.Time{}, errors.New("ms is err")
	}
	nsec := ms * 1e6
	return time.Unix(0, nsec), nil
}

// 获取分钟级别的时间戳，可以指定分钟offset
func MiniteTimestamp(offset int64) int64 {
	return time.Now().Unix()/60 - offset
}

func UnixToTimestring(n int64) string {
	now := time.Unix(n, 0)
	return Time2StringSecond(now)
}

func UnixMsToTimestring(n int64) string {
	now := time.Unix(n/1000, 0)
	return Time2StringSecond(now)
}

func UnixMsToTimestringMinute(n int64) string {
	now := time.Unix(n/1000, 0)
	return Time2StringMinute(now)
}


func GetAgeString(t time.Time) string {
	if t.IsZero() {
		return "?"
	}

	sinceNow := time.Since(t)
	minutes := sinceNow.Minutes()
	years := int(math.Floor(minutes / 525600))
	months := int(math.Floor(minutes / 43800))
	days := int(math.Floor(minutes / 1440))
	hours := int(math.Floor(minutes / 60))

	if years > 0 {
		return fmt.Sprintf("%dy ago", years)
	}
	if months > 0 {
		return fmt.Sprintf("%dM ago", months)
	}
	if days > 0 {
		return fmt.Sprintf("%dd ago", days)
	}
	if hours > 0 {
		return fmt.Sprintf("%dh ago", hours)
	}
	if int(minutes) > 0 {
		return fmt.Sprintf("%dm ago", int(minutes))
	}

	return "< 1m"
}