package app

import (
	"math"
	"time"

	"github.com/tracedt/koala/dashboard/internal/pkg/cql"

	"github.com/labstack/echo"
	"github.com/tracedt/koala/dashboard/internal/pkg/code"
	"github.com/tracedt/koala/dashboard/internal/pkg/http"
	"github.com/tracedt/koala/dashboard/internal/pkg/misc"
	"github.com/tracedt/koala/pkg/utils"

	"go.uber.org/zap"
)

// DashResult hold the dashboard return data
type DashResult struct {
	Suc         bool      `json:"suc"` //是否有数据
	Timeline    []string  `json:"timeline"`
	CountList   []float64 `json:"count_list"`
	ElapsedList []float64 `json:"elapsed_list"`
	ApdexList   []float64 `json:"apdex_list"`
	ErrorList   []float64 `json:"error_list"`
	ExList      []int     `json:"ex_list"`
}

// Dashboard return the chart data of the application
func Dashboard(c echo.Context) error {
	appName := c.FormValue("app_name")
	start, end, err := misc.StartEndDate(c)
	if err != nil {
		misc.Logger.Info("invalid date params", zap.String("start", c.FormValue("start")), zap.String("end", c.FormValue("end")), zap.Error(err))
		return c.JSON(http.StatusBadRequest, http.Resp{
			ErrCode: code.DateInvalid,
			Message: code.DateInvalidMsg,
		})
	}

	timeline, timeBucks, suc := appDashboard(appName, start, end)

	// 把结果数据按照时间点顺序存放
	//请求次数列表
	countList := make([]float64, 0)
	//耗时列表
	elapsedList := make([]float64, 0)
	//apdex列表
	apdexList := make([]float64, 0)
	//错误率列表
	errorList := make([]float64, 0)
	//异常率列表
	exList := make([]int, 0)
	for _, ts := range timeline {
		stat := timeBucks[ts]
		if math.IsNaN(stat.AverageElapsed) {
			stat.AverageElapsed = 0
		}

		if math.IsNaN(stat.ErrorPercent) {
			stat.ErrorPercent = 0
		}

		countList = append(countList, float64(stat.Count))
		elapsedList = append(elapsedList, stat.AverageElapsed)
		errorList = append(errorList, stat.ErrorPercent)
		exList = append(exList, stat.ExPercent)
	}

	return c.JSON(http.StatusOK, http.Resp{
		Data: DashResult{
			Suc:         suc,
			Timeline:    timeline,
			CountList:   countList,
			ElapsedList: elapsedList,
			ApdexList:   apdexList,
			ErrorList:   errorList,
			ExList:      exList,
		},
	})
}

func appDashboard(appName string, start, end time.Time) ([]string, map[string]*Stat, bool) {
	if start.Second() != 0 {
		start = start.Add(time.Duration(60-start.Second()) * time.Second)
	}
	if end.Second() != 0 {
		end = end.Add(-1 * time.Duration(end.Second()) * time.Second)
	}

	timeline := make([]string, 0)
	timeBucks := make(map[string]*Stat)
	suc := true
	// 小于等于60分钟的，一分钟一个点
	// 其他情况按照时间做聚合

	// 查询时间间隔要转换为30的倍数，然后按照倍数聚合相应的点，最终形成30个图绘制点
	//计算间隔
	intv := int(end.Sub(start).Minutes())

	var step int

	current := start
	if intv <= 180 {
		step = 1
	} else {
		step = int(end.Sub(start).Minutes())/30 + 1
	}

	for {
		if current.Unix() > end.Unix() {
			break
		}
		cs := misc.TimeToChartString2(current)
		timeline = append(timeline, cs)
		timeBucks[cs] = &Stat{}
		current = current.Add(time.Duration(step) * time.Minute)
	}

	// 读取相应数据，按照时间填到对应的桶中
	q := cql.Dynamic.Query(`SELECT duration,count,err_count,input_date FROM api_stats WHERE app_name = ? and input_date >= ? and input_date <= ? `, appName, start.Unix(), end.Unix())
	iter := q.Iter()

	if iter.NumRows() == 0 {
		suc = false
		return timeline, timeBucks, suc
	}

	// apps := make(map[string]*AppStat)
	var tElapsed, errCount, count int
	var inputDate int64
	for iter.Scan(&tElapsed, &count, &errCount, &inputDate) {
		t := time.Unix(inputDate, 0)
		// 计算该时间落在哪个时间桶里
		i := (int(t.Sub(start).Minutes()) / step)
		t1 := start.Add(time.Minute * time.Duration(i*step))
		ts := misc.TimeToChartString2(t1)
		app := timeBucks[ts]
		app.Count += float64(count)
		app.totalElapsed += tElapsed
		app.errCount += errCount
	}

	if err := iter.Close(); err != nil {
		misc.Logger.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
	}

	// 读取JVM异常数据，按照时间填到对应的桶中
	q1 := cql.Dynamic.Query(`SELECT count,input_date  FROM exception_stats WHERE app_name=? and input_date >= ? and input_date <= ? `, appName, start.Unix(), end.Unix())
	iter1 := q1.Iter()

	// apps := make(map[string]*AppStat)
	var count1 int
	var inputDate1 int64
	for iter1.Scan(&count1, &inputDate1) {
		t := time.Unix(inputDate1, 0)
		// 计算该时间落在哪个时间桶里
		i := int(t.Sub(start).Minutes()) / step
		t1 := start.Add(time.Minute * time.Duration(i*step))

		ts := misc.TimeToChartString2(t1)
		app, ok := timeBucks[ts]
		if ok {
			app.exCount += count1
		}
	}

	if err := iter.Close(); err != nil {
		misc.Logger.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
	}

	// 对每个桶里的数据进行计算
	for _, app := range timeBucks {
		if app.Count != 0 {
			app.ExPercent = 100 * app.exCount / int(app.Count)
		}
		app.ErrorPercent = utils.DecimalPrecision(100 * float64(app.errCount) / app.Count)
		app.AverageElapsed = utils.DecimalPrecision(float64(app.totalElapsed) / app.Count)
		app.Count = utils.DecimalPrecision(app.Count / float64(step))
	}

	return timeline, timeBucks, suc
}
