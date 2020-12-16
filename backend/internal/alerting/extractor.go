package alerting

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"time"

	"github.com/opendatav/datav/backend/pkg/models"
	"github.com/opendatav/datav/backend/pkg/utils/simplejson"
)

// DashAlertExtractor extracts alerts from the dashboard json.
type DashAlertExtractor struct {
	Dash *models.Dashboard
}

func findPanelQueryByRefID(panel *simplejson.Json, refID string) *simplejson.Json {
	for _, targetsObj := range panel.Get("targets").MustArray() {
		target := simplejson.NewFromAny(targetsObj)

		if target.Get("refId").MustString() == refID {
			return target
		}
	}
	return nil
}

func copyJSON(in *simplejson.Json) (*simplejson.Json, error) {
	rawJSON, err := in.MarshalJSON()
	if err != nil {
		return nil, err
	}

	return simplejson.NewJson(rawJSON)
}

func (e *DashAlertExtractor) getAlertFromPanels(jsonWithPanels *simplejson.Json, validateAlertFunc func(*models.Alert) bool) ([]*models.Alert, error) {
	alerts := make([]*models.Alert, 0)

	for _, panelObj := range jsonWithPanels.Get("panels").MustArray() {
		panel := simplejson.NewFromAny(panelObj)

		collapsedJSON, collapsed := panel.CheckGet("collapsed")
		// check if the panel is collapsed
		if collapsed && collapsedJSON.MustBool() {

			// extract alerts from sub panels for collapsed panels
			alertSlice, err := e.getAlertFromPanels(panel, validateAlertFunc)
			if err != nil {
				return nil, err
			}

			alerts = append(alerts, alertSlice...)
			continue
		}

		jsonAlert, hasAlert := panel.CheckGet("alert")

		if !hasAlert {
			continue
		}

		panelID, err := panel.Get("id").Int64()
		if err != nil {
			return nil, errors.New("A numeric panel id property is missing")
		}

		// backward compatibility check, can be removed later
		enabled, hasEnabled := jsonAlert.CheckGet("enabled")
		if hasEnabled && !enabled.MustBool() {
			continue
		}

		frequency, err := getTimeDurationStringToSeconds(jsonAlert.Get("frequency").MustString())
		if err != nil {
			return nil, err
		}

		rawFor := jsonAlert.Get("for").MustString()
		var forValue time.Duration
		if rawFor != "" {
			forValue, err = time.ParseDuration(rawFor)
			if err != nil {
				return nil, errors.New("Could not parse for")
			}
		}

		alert := &models.Alert{
			DashboardId: e.Dash.Id,
			PanelId:     panelID,
			Id:          jsonAlert.Get("id").MustInt64(),
			Name:        jsonAlert.Get("name").MustString(),
			Handler:     jsonAlert.Get("handler").MustInt64(),
			Message:     jsonAlert.Get("message").MustString(),
			Frequency:   frequency,
			For:         forValue,
		}

		for _, condition := range jsonAlert.Get("conditions").MustArray() {
			jsonCondition := simplejson.NewFromAny(condition)

			jsonQuery := jsonCondition.Get("query")
			queryRefID := jsonQuery.Get("refId").MustString()
			panelQuery := findPanelQueryByRefID(panel, queryRefID)

			if panelQuery == nil {
				reason := fmt.Sprintf("Alert on PanelId: %v refers to query(%s) that cannot be found", alert.PanelId, queryRefID)
				return nil, errors.New(reason)
			}

			dsName := ""
			if panelQuery.Get("datasource").MustString() != "" {
				dsName = panelQuery.Get("datasource").MustString()
			} else if panel.Get("datasource").MustString() != "" {
				dsName = panel.Get("datasource").MustString()
			}

			var datasource *models.DataSource
			var err1 error
			if dsName == "" {
				datasource, err1 = models.QueryDefaultDataSource()
			} else {
				datasource, err1 = models.QueryDataSource(0, dsName)
			}

			if err1 != nil {
				logger.Warn("query datasource error", "error", err1)
				return nil, err1
			}

			if datasource == nil {
				return nil, fmt.Errorf("Data source used by alert rule not found, alertName=%v, datasource=%s", alert.Name, dsName)
			}

			jsonQuery.SetPath([]string{"datasourceId"}, datasource.Id)

			if interval, err := panel.Get("interval").String(); err == nil {
				panelQuery.Set("interval", interval)
			}

			jsonQuery.Set("model", panelQuery.Interface())
		}

		alert.Settings = jsonAlert

		// validate
		_, err = NewRuleFromDBAlert(alert)
		if err != nil {
			return nil, err
		}

		if !validateAlertFunc(alert) {
			return nil, fmt.Errorf("Panel id is not correct, alertName=%v, panelId=%v", alert.Name, alert.PanelId)
		}

		expBuf, _ := json.Marshal(jsonAlert.Get("sendExceptions"))
		var exp []*models.SendException
		json.Unmarshal(expBuf, &exp)

		alert.SendExceptions = exp

		alerts = append(alerts, alert)
	}

	return alerts, nil
}

func validateAlertRule(alert *models.Alert) bool {
	return alert.ValidToSave()
}

// GetAlerts extracts alerts from the dashboard json and does full validation on the alert json data.
func (e *DashAlertExtractor) GetAlerts() ([]*models.Alert, error) {
	return e.extractAlerts(validateAlertRule)
}

func (e *DashAlertExtractor) extractAlerts(validateFunc func(alert *models.Alert) bool) ([]*models.Alert, error) {
	dashboardJSON, err := copyJSON(e.Dash.Data)
	if err != nil {
		return nil, err
	}

	alerts := make([]*models.Alert, 0)

	// We extract alerts from rows to be backwards compatible
	// with the old dashboard json model.
	rows := dashboardJSON.Get("rows").MustArray()
	if len(rows) > 0 {
		for _, rowObj := range rows {
			row := simplejson.NewFromAny(rowObj)
			a, err := e.getAlertFromPanels(row, validateFunc)
			if err != nil {
				return nil, err
			}

			alerts = append(alerts, a...)
		}
	} else {
		a, err := e.getAlertFromPanels(dashboardJSON, validateFunc)
		if err != nil {
			return nil, err
		}

		alerts = append(alerts, a...)
	}

	logger.Debug("Extracted alerts from dashboard", "alertCount", len(alerts))
	return alerts, nil
}

// ValidateAlerts validates alerts in the dashboard json but does not require a valid dashboard id
// in the first validation pass.
func (e *DashAlertExtractor) ValidateAlerts() error {
	_, err := e.extractAlerts(func(alert *models.Alert) bool { return alert.PanelId != 0 })
	return err
}

var (
	valueFormatRegex = regexp.MustCompile(`^\d+`)
	unitFormatRegex  = regexp.MustCompile(`\w{1}$`)
)
var (
	// ErrFrequencyCannotBeZeroOrLess frequency cannot be below zero
	ErrFrequencyCannotBeZeroOrLess = errors.New(`"evaluate every" cannot be zero or below`)

	// ErrFrequencyCouldNotBeParsed frequency cannot be parsed
	ErrFrequencyCouldNotBeParsed = errors.New(`"evaluate every" field could not be parsed`)
)

var unitMultiplier = map[string]int{
	"s": 1,
	"m": 60,
	"h": 3600,
	"d": 86400,
}

func getTimeDurationStringToSeconds(str string) (int64, error) {
	multiplier := 1

	matches := valueFormatRegex.FindAllString(str, 1)

	if len(matches) <= 0 {
		return 0, ErrFrequencyCouldNotBeParsed
	}

	value, err := strconv.Atoi(matches[0])
	if err != nil {
		return 0, err
	}

	if value == 0 {
		return 0, ErrFrequencyCannotBeZeroOrLess
	}

	unit := unitFormatRegex.FindAllString(str, 1)[0]

	if val, ok := unitMultiplier[unit]; ok {
		multiplier = val
	}

	return int64(value * multiplier), nil
}
