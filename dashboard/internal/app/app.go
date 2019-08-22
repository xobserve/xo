package app

import (
	"sort"
	"strconv"

	"github.com/tracedt/koala/dashboard/internal/pkg/code"
	"github.com/tracedt/koala/dashboard/internal/pkg/http"
	"github.com/tracedt/koala/pkg/utils"

	"github.com/labstack/echo"
	"github.com/tracedt/koala/dashboard/internal/pkg/alert"
	"github.com/tracedt/koala/dashboard/internal/pkg/cql"
	"github.com/tracedt/koala/dashboard/internal/pkg/misc"
	"go.uber.org/zap"
)

// NameList return the application name list
func NameList(c echo.Context) error {
	names := nameList(true)
	return c.JSON(http.StatusOK, http.Resp{
		Data: names,
	})
}

func nameList(sorted bool) []string {
	q := cql.Static.Query(`SELECT app_name FROM apps `)
	iter := q.Iter()

	names := make([]string, 0)
	var name string
	for iter.Scan(&name) {
		names = append(names, name)
	}
	if err := iter.Close(); err != nil {
		misc.Logger.Warn("database error", zap.Error(err), zap.String("query", q.String()))
	}

	if sorted {
		sort.Strings(names)
	}
	return names
}

// Alerts return application alerts history to client
func Alerts(c echo.Context) error {
	an := c.FormValue("app_name")
	limit, _ := strconv.Atoi(c.FormValue("limit"))
	q := cql.Dynamic.Query(`SELECT id,type,alert_value,input_date,alert FROM alert_history where const_id=1 and app_name=? limit ?`, an, limit)

	var id string
	var inputDate int64
	var tp int
	var value float64

	tpl := &alert.Template{}
	hs := make(alert.Histories, 0)

	iter := q.Iter()
	for iter.Scan(&id, &tp, &value, &inputDate, &tpl) {
		hs = append(hs, &alert.History{
			ID:        id,
			Type:      tp,
			AppName:   an,
			Channel:   "",
			InputDate: utils.UnixToTimestring(inputDate),
			Alert:     tpl.Name,
			Value:     utils.DecimalPrecision(value),
			Users:     nil,
			Date:      inputDate,
		})
	}

	if err := iter.Close(); err != nil {
		misc.Logger.Warn("database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, http.Resp{
			ErrCode: code.DatabaseError,
			Message: code.DatabaseErrorMsg,
		})
	}

	sort.Sort(hs)
	return c.JSON(http.StatusOK, http.Resp{
		Data: hs,
	})
}
