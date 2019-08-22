package utils

import (
	"errors"
	"time"
)

// Time2String convert time.Time to 2006-01-02 15:04:05.999 format
func Time2String(t time.Time) string {
	return t.Format("2006-01-02 15:04:05.999")
}

// Time2StringSecond convert time.Time to 2006-01-02 15:04:05 format
func Time2StringSecond(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

// StringToTime convert 2006-1-2 15:04:05 format to time.Time
func StringToTime(s string) (time.Time, error) {
	loc, _ := time.LoadLocation("Local")
	t, err := time.ParseInLocation("2006-1-2 15:04:05", s, loc)
	return t, err
}

// StringToTime1 convert 2006-01-02T15:04:05+08:00 format to time.Time
func StringToTime1(s string) (time.Time, error) {
	loc, _ := time.LoadLocation("Local")
	t, err := time.ParseInLocation("2006-01-02T15:04:05+08:00", s, loc)
	return t, err
}

// StringToTime2 convert 2006-1-2 15:04 format to time.Time
func StringToTime2(s string) (time.Time, error) {
	loc, _ := time.LoadLocation("Local")
	t, err := time.ParseInLocation("2006-01-02 15:04", s, loc)
	return t, err
}

// NSToTime convert nanosecond timestamp to time.Time
func NSToTime(ns int64) (time.Time, error) {
	if ns <= 0 {
		return time.Time{}, errors.New("ns is err")
	}
	sec := ns / 1e9
	nsec := ns - sec*1e9
	return time.Unix(sec, nsec), nil
}

// MSToTime convert millisecond timestamp to time.Time
func MSToTime(ms int64) (time.Time, error) {
	if ms <= 0 {
		return time.Time{}, errors.New("ms is err")
	}
	nsec := ms * 1e6
	return time.Unix(0, nsec), nil
}

// UnixToTimestring convert unix timestamp to  2006-01-02 15:04:05 format
func UnixToTimestring(n int64) string {
	now := time.Unix(n, 0)
	return Time2StringSecond(now)
}

// UnixMsToTimestring convert millisecond timestamp to  2006-01-02 15:04:05 format
func UnixMsToTimestring(n int64) string {
	now := time.Unix(n/1000, 0)
	return Time2StringSecond(now)
}
