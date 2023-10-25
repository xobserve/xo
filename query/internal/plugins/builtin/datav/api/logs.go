package api

import (
	"fmt"
	"strconv"
	"strings"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	pluginUtils "github.com/DataObserve/datav/query/internal/plugins/utils"
	"github.com/DataObserve/datav/query/pkg/config"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/davecgh/go-spew/spew"
	"github.com/gin-gonic/gin"
	sb "github.com/huandu/go-sqlbuilder"
	lep "github.com/mgudov/logic-expression-parser"
)

func GetLogs(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	step, _ := strconv.ParseInt(c.Query("step"), 10, 64)
	start, _ := strconv.ParseInt(c.Query("start"), 10, 64)
	end, _ := strconv.ParseInt(c.Query("end"), 10, 64)
	page, _ := strconv.ParseInt(c.Query("page"), 10, 64)

	perPageLogsI := params["perPage"]
	perPageLogs := 100
	if perPageLogsI != nil {
		perPage := int(perPageLogsI.(float64))
		if perPage != 0 {
			perPageLogs = perPage
		}
	}

	logId := c.Query("logId")
	logTs := c.Query("logTs")

	if logId != "" {
		// query logs
		logsQuery := fmt.Sprintf(datavmodels.LogSelectSQL+" FROM %s.%s  where timestamp = ? AND id = ?", config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable)

		rows, err := conn.Query(c.Request.Context(), logsQuery, logTs, logId)
		if err != nil {
			logger.Warn("Error Query log", "query", logsQuery, "error", err)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}
		defer rows.Close()

		logger.Info("Query log", "query", logsQuery)

		res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
		if err != nil {
			logger.Warn("Error conver rows to data", "error", err)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}

		return models.GenPluginResult(models.PluginStatusSuccess, "", res)
	}

	search := c.Query("search")
	var searchQuery string
	var searchArgs []interface{}
	if search != "" {
		var err error
		searchQuery, searchArgs, err = parseSearchQuery(search)
		if err != nil {
			logger.Info("Error parse search query", "error", err, "query", search)
			return models.GenPluginResult(models.PluginStatusError, "Parse search query error: "+err.Error(), nil)
		}
	}
	// query logs
	logsQuery := fmt.Sprintf(datavmodels.LogsSelectSQL+" FROM %s.%s  where (timestamp >= ? AND timestamp <= ? %s) order by timestamp desc LIMIT %d OFFSET %d", config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable, searchQuery, perPageLogs, page*int64(perPageLogs))

	args := append([]interface{}{start * 1e9, (end) * 1e9}, searchArgs...)
	rows, err := conn.Query(c.Request.Context(), logsQuery, args...)
	if err != nil {
		logger.Warn("Error Query logs", "query", logsQuery, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query logs", "query", logsQuery, "search", searchQuery, "args", args)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		logger.Warn("Error conver rows to data", "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	var res1 *models.PluginResultData
	if page == 0 {
		// query metrics
		metricsQuery := fmt.Sprintf("SELECT toStartOfInterval(fromUnixTimestamp64Nano(timestamp), INTERVAL %d SECOND) AS ts_bucket, if(multiSearchAny(severity, ['error', 'err', 'emerg', 'alert', 'crit', 'fatal']), 'errors', 'others') as severity_group, count(*) as count from %s.%s where (timestamp >= ? AND timestamp <= ? %s) group by ts_bucket,severity_group order by ts_bucket", step, config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable, searchQuery)

		rows, err = conn.Query(c.Request.Context(), metricsQuery, args...)
		if err != nil {
			logger.Warn("Error Query log metrics", "query", metricsQuery, "error", err)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}
		defer rows.Close()

		logger.Info("Query log metrics", "query", metricsQuery)

		res1, err = pluginUtils.ConvertDbRowsToPluginData(rows)
		if err != nil {
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", map[string]*models.PluginResultData{
		"logs":  res,
		"chart": res1,
	})
}

func parseSearchQuery(query string) (string, []interface{}, error) {
	result, err := lep.ParseExpression(query)
	if err != nil {
		return "", nil, err
	}

	sql := sb.NewSelectBuilder()
	where, err := traverse(sql, result)
	if err != nil {
		return "", nil, err
	}
	sql.Where(where)
	s, args := sql.Build()

	if s == "" {
		return "", nil, nil
	}

	return "AND " + s[5:], args, nil
}

func traverse(sql *sb.SelectBuilder, expr lep.Expression) (string, error) {
	dump := spew.NewDefaultConfig()
	dump.DisablePointerAddresses = true
	dump.DisableMethods = true
	dump.Dump(expr)

	switch e := expr.(type) {
	case *lep.OrX:
		var args []string
		for _, disjunction := range e.Disjunctions {
			arg, err := traverse(sql, disjunction)
			if err != nil {
				return "", err
			}
			args = append(args, arg)
		}
		return sql.Or(args...), nil
	case *lep.AndX:
		var args []string
		for _, conjunct := range e.Conjuncts {
			arg, err := traverse(sql, conjunct)
			if err != nil {
				return "", err
			}
			args = append(args, arg)
		}
		return sql.And(args...), nil
	case *lep.EqualsX:
		value := e.Value.Value()
		if value == nil {
			return sql.IsNotNull(e.Param.String()), nil
		}

		return sql.Equal(mapSqlField(e.Param.String(), value)), nil
	case *lep.NotEqualsX:
		value := e.Value.Value()
		field, newValue := mapSqlField(e.Param.String(), value)
		if value == nil {
			return sql.IsNotNull(field), nil
		}
		return sql.NotEqual(field, newValue), nil
	case *lep.GreaterThanX:
		value := e.Value.Value()
		return sql.GreaterThan(mapSqlField(e.Param.String(), value)), nil
	case *lep.GreaterThanEqualX:
		value := e.Value.Value()
		return sql.GreaterEqualThan(mapSqlField(e.Param.String(), value)), nil
	case *lep.LessThanX:
		value := e.Value.Value()
		return sql.LessThan(mapSqlField(e.Param.String(), value)), nil
	case *lep.LessThanEqualX:
		value := e.Value.Value()
		return sql.LessEqualThan(mapSqlField(e.Param.String(), value)), nil
	case *lep.MatchRegexpX:
		value := e.GetValue().String()
		k, v := mapSqlField(e.Param.String(), strings.ReplaceAll(value, "/", "%"))
		return sql.Like(fmt.Sprintf("lower(%s)", k), v), nil
	case *lep.NotMatchRegexpX:
		value := e.GetValue().String()
		k, v := mapSqlField(e.Param.String(), strings.ReplaceAll(value, "/", "%"))
		return sql.NotLike(fmt.Sprintf("lower(%s)", k), v), nil
	default:
		return "", fmt.Errorf("target operator not implemented : %T", e)
		// TODO: other cases
	}
}

func mapSqlField(field string, value interface{}) (string, interface{}) {
	var valueType string
	switch value.(type) {
	case int64:
		valueType = "int64"
	case float64:
		valueType = "float64"
	case string:
		valueType = "string"
	default:
		fmt.Println("unknown type", value)
	}

	newValue := value
	if valueType == "string" {
		newValue = strings.ToLower(value.(string))
	}

	if strings.HasPrefix(field, "resources.") {
		name := field[10:]

		return fmt.Sprintf("lower(resources_string_value[indexOf(resources_string_key, '%s')])", name), newValue
	}

	if strings.HasPrefix(field, "attributes.") {
		if valueType == "string" {
			return fmt.Sprintf("lower(attributes_%s_value[indexOf(attributes_%s_key, '%s')])", valueType, valueType, field[11:]), newValue
		}
		return fmt.Sprintf("attributes_%s_value[indexOf(attributes_%s_key, '%s')]", valueType, valueType, field[11:]), newValue
		// name := field[11:]
		// return
	}

	return field, newValue
}
