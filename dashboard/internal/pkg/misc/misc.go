package misc

import (
	"time"

	"github.com/tracedt/koala/pkg/utils"

	"github.com/labstack/echo"
)

// StartEndDate get the start and end date
func StartEndDate(c echo.Context) (start time.Time, end time.Time, err error) {
	startRaw := c.FormValue("start")
	endRaw := c.FormValue("end")

	// start和end的时间字符串转成秒级时间戳:2019-01-10 00:00:00
	start, err = utils.StringToTime(startRaw)
	if err != nil {
		return
	}

	end, err = utils.StringToTime(endRaw)
	if err != nil {
		return
	}

	// utils.OnlyAlphaAndNum
	return
}

// Timestamp2TimeString convert timestamp to time string
func Timestamp2TimeString(t int64) string {
	tm, _ := utils.MSToTime(t)
	return tm.Format("2006-01-02 15:04:05.999")
}

// TimeToChartString convert time to our chart string
func TimeToChartString(t time.Time) string {
	return t.Format("01-02 15:04")
}

// TimeToChartString1 convert time to our chart string
func TimeToChartString1(t time.Time) string {
	return t.Format("01-02 15:04:05")
}

// TimeToChartString2 convert time to our chart string
func TimeToChartString2(t time.Time) string {
	return t.Format("06-01-02 15:04")
}
