package conditions

import (
	"fmt"
	"strings"
	"time"

	"github.com/CodeCreatively/datav/backend/pkg/models"

	gocontext "context"

	"github.com/CodeCreatively/datav/backend/pkg/tsdb"
	"github.com/CodeCreatively/datav/backend/pkg/utils/errutil"
	"github.com/CodeCreatively/datav/backend/pkg/utils/null"
	"github.com/CodeCreatively/datav/backend/pkg/utils/simplejson"
)

func init() {
	RegisterCondition("query", func(model *simplejson.Json, index int) (models.Condition, error) {
		return newQueryCondition(model, index)
	})
}

// QueryCondition is responsible for issue and query, reduce the
// timeseries into single values and evaluate if they are firing or not.
type QueryCondition struct {
	Index         int
	Query         AlertQuery
	Reducer       *queryReducer
	Evaluator     AlertEvaluator
	Operator      string
	HandleRequest tsdb.HandleRequestFunc
}

// AlertQuery contains information about what datasource a query
// should be sent to and the query object.
type AlertQuery struct {
	Model        *simplejson.Json
	DatasourceID int64
	From         string
	To           string
}

// Eval evaluates the `QueryCondition`.
func (c *QueryCondition) Eval(context *models.EvalContext) (*models.ConditionResult, error) {
	timeRange := tsdb.NewTimeRange(c.Query.From, c.Query.To)
	seriesList, err := c.executeQuery(context, timeRange)
	if err != nil {
		return nil, err
	}

	emptySeriesCount := 0
	evalMatchCount := 0
	var matches []*models.EvalMatch

	for _, series := range seriesList {
		reducedValue := c.Reducer.Reduce(series)

		evalMatch := c.Evaluator.Eval(reducedValue)

		if !reducedValue.Valid {
			emptySeriesCount++
		}

		if context.IsTestRun {
			context.Logs = append(context.Logs, &models.ResultLogEntry{
				Message: fmt.Sprintf("Condition[%d]: Eval: %v, Metric: %s, Value: %s", c.Index, evalMatch, series.Name, reducedValue),
			})
		}

		if evalMatch {
			evalMatchCount++

			matches = append(matches, &models.EvalMatch{
				Metric: series.Name,
				Value:  reducedValue,
				Tags:   series.Tags,
			})
		}
	}

	// handle no series special case
	if len(seriesList) == 0 {
		// eval condition for null value
		evalMatch := c.Evaluator.Eval(null.FloatFromPtr(nil))

		if context.IsTestRun {
			context.Logs = append(context.Logs, &models.ResultLogEntry{
				Message: fmt.Sprintf("Condition: Eval: %v, Query Returned No Series (reduced to null/no value)", evalMatch),
			})
		}

		if evalMatch {
			evalMatchCount++
			matches = append(matches, &models.EvalMatch{Metric: "NoData", Value: null.FloatFromPtr(nil)})
		}
	}

	return &models.ConditionResult{
		Firing:      evalMatchCount > 0,
		NoDataFound: emptySeriesCount == len(seriesList),
		Operator:    c.Operator,
		EvalMatches: matches,
	}, nil
}

func (c *QueryCondition) executeQuery(context *models.EvalContext, timeRange *tsdb.TimeRange) (tsdb.TimeSeriesSlice, error) {
	ds, err := models.QueryDataSource(c.Query.DatasourceID, "")
	if err != nil {
		return nil, err
	}
	req := c.getRequestForAlertRule(ds, timeRange, context.IsDebug)
	result := make(tsdb.TimeSeriesSlice, 0)

	if context.IsDebug {
		data := simplejson.New()
		if req.TimeRange != nil {
			data.Set("from", req.TimeRange.GetFromAsMsEpoch())
			data.Set("to", req.TimeRange.GetToAsMsEpoch())
		}

		type queryDto struct {
			RefID         string           `json:"refId"`
			Model         *simplejson.Json `json:"model"`
			Datasource    *simplejson.Json `json:"datasource"`
			MaxDataPoints int64            `json:"maxDataPoints"`
			IntervalMs    int64            `json:"intervalMs"`
		}

		queries := []*queryDto{}
		for _, q := range req.Queries {
			queries = append(queries, &queryDto{
				RefID: q.RefId,
				Model: q.Model,
				Datasource: simplejson.NewFromAny(map[string]interface{}{
					"id":   q.DataSource.Id,
					"name": q.DataSource.Name,
				}),
				MaxDataPoints: q.MaxDataPoints,
				IntervalMs:    q.IntervalMs,
			})
		}

		data.Set("queries", queries)

		context.Logs = append(context.Logs, &models.ResultLogEntry{
			Message: fmt.Sprintf("Condition[%d]: Query", c.Index),
			Data:    data,
		})
	}

	resp, err := c.HandleRequest(context.Ctx, ds, req)
	if err != nil {
		if err == gocontext.DeadlineExceeded {
			return nil, fmt.Errorf("Alert execution exceeded the timeout")
		}

		return nil, fmt.Errorf("tsdb.HandleRequest() error %v", err)
	}

	for _, v := range resp.Results {
		if v.Error != nil {
			return nil, fmt.Errorf("tsdb.HandleRequest() response error %v", v)
		}

		// If there are dataframes but no series on the result
		useDataframes := v.Dataframes != nil && (v.Series == nil || len(v.Series) == 0)

		if useDataframes { // convert the dataframes to tsdb.TimeSeries
			frames, err := v.Dataframes.Decoded()
			if err != nil {
				return nil, errutil.Wrap("tsdb.HandleRequest() failed to unmarshal arrow dataframes from bytes", err)
			}

			for _, frame := range frames {
				ss, err := tsdb.FrameToSeriesSlice(frame)
				if err != nil {
					return nil, errutil.Wrapf(err, `tsdb.HandleRequest() failed to convert dataframe "%v" to tsdb.TimeSeriesSlice`, frame.Name)
				}
				result = append(result, ss...)
			}
		} else {
			result = append(result, v.Series...)
		}

		queryResultData := map[string]interface{}{}

		if context.IsTestRun {
			queryResultData["series"] = result
		}

		if context.IsDebug && v.Meta != nil {
			queryResultData["meta"] = v.Meta
		}

		if context.IsTestRun || context.IsDebug {
			if useDataframes {
				queryResultData["fromDataframe"] = true
			}
			context.Logs = append(context.Logs, &models.ResultLogEntry{
				Message: fmt.Sprintf("Condition[%d]: Query Result", c.Index),
				Data:    simplejson.NewFromAny(queryResultData),
			})
		}
	}

	return result, nil
}

func (c *QueryCondition) getRequestForAlertRule(datasource *models.DataSource, timeRange *tsdb.TimeRange, debug bool) *tsdb.TsdbQuery {
	queryModel := c.Query.Model
	req := &tsdb.TsdbQuery{
		TimeRange: timeRange,
		Queries: []*tsdb.Query{
			{
				RefId:      "A",
				Model:      queryModel,
				DataSource: datasource,
				QueryType:  queryModel.Get("queryType").MustString(""),
			},
		},
		Headers: map[string]string{
			"FromAlert": "true",
		},
		Debug: debug,
	}

	return req
}

func newQueryCondition(model *simplejson.Json, index int) (*QueryCondition, error) {
	condition := QueryCondition{}
	condition.Index = index
	condition.HandleRequest = tsdb.HandleRequest

	queryJSON := model.Get("query")

	condition.Query.Model = queryJSON.Get("model")
	condition.Query.From = queryJSON.Get("lastFor").MustString()
	condition.Query.To = "now"

	if err := validateFromValue(condition.Query.From); err != nil {
		return nil, err
	}

	if err := validateToValue(condition.Query.To); err != nil {
		return nil, err
	}

	condition.Query.DatasourceID = queryJSON.Get("datasourceId").MustInt64()

	reducer := model.Get("reducer").MustString()
	condition.Reducer = newSimpleReducer(reducer)

	evaluatorJSON := model.Get("evaluator")
	evaluator, err := NewAlertEvaluator(evaluatorJSON)
	if err != nil {
		return nil, fmt.Errorf("error in condition %v: %v", index, err)
	}
	condition.Evaluator = evaluator

	operatorJSON := model.Get("operator")
	operator := operatorJSON.Get("type").MustString("and")
	condition.Operator = operator

	return &condition, nil
}

func validateFromValue(from string) error {
	fromRaw := strings.Replace(from, "now-", "", 1)

	_, err := time.ParseDuration("-" + fromRaw)
	return err
}

func validateToValue(to string) error {
	if to == "now" {
		return nil
	} else if strings.HasPrefix(to, "now-") {
		withoutNow := strings.Replace(to, "now-", "", 1)

		_, err := time.ParseDuration("-" + withoutNow)
		if err == nil {
			return nil
		}
	}

	_, err := time.ParseDuration(to)
	return err
}
