package alerting

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	_ "github.com/code-creatively/datav/backend/pkg/tsdb"

	"github.com/code-creatively/datav/backend/internal/acl"
	"github.com/code-creatively/datav/backend/internal/session"
	"github.com/code-creatively/datav/backend/pkg/common"
	"github.com/code-creatively/datav/backend/pkg/db"
	"github.com/code-creatively/datav/backend/pkg/i18n"
	"github.com/code-creatively/datav/backend/pkg/models"
	"github.com/code-creatively/datav/backend/pkg/utils/null"
	"github.com/code-creatively/datav/backend/pkg/utils/simplejson"
	"github.com/gin-gonic/gin"
)

func AddNotification(c *gin.Context) {
	nf := &models.AlertNotification{}
	c.Bind(&nf)

	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if !acl.IsTeamEditor(teamId, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	settings, _ := nf.Settings.Encode()
	now := time.Now()
	_, err := db.SQL.Exec(`INSERT INTO alert_notification (team_id, name, type, is_default, disable_resolve_message, send_reminder, upload_image, settings, created_by, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		teamId, nf.Name, nf.Type, nf.IsDefault, nf.DisableResolveMessage, nf.SendReminder, nf.UploadImage, settings, session.CurrentUserId(c), now, now)
	if err != nil {
		logger.Warn("add alert notification error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

}

func UpdateNotification(c *gin.Context) {
	nf := &models.AlertNotification{}
	c.Bind(&nf)

	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if nf.Id == 0 || teamId == 0 || teamId != nf.TeamId {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if !acl.IsTeamEditor(teamId, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	settings, _ := nf.Settings.Encode()
	now := time.Now()
	_, err := db.SQL.Exec(`UPDATE alert_notification SET name=?, type=?, is_default=?, disable_resolve_message=?, send_reminder=?, upload_image=?, settings=?, updated=? WHERE id=?`,
		nf.Name, nf.Type, nf.IsDefault, nf.DisableResolveMessage, nf.SendReminder, nf.UploadImage, settings, now, nf.Id)
	if err != nil {
		logger.Warn("add alert notification error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}
}

func DeleteNotification(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	notification, err := models.QueryNotification(id)
	if err != nil {
		logger.Warn("query notification error", "error", err)
		c.JSON(400, common.ResponseInternalError())
		return
	}

	if !acl.IsTeamEditor(notification.TeamId, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	_, err = db.SQL.Exec(`DELETE FROM alert_notification WHERE id=?`, id)
	if err != nil {
		logger.Warn("get alert notification error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}
}

func GetNotifications(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	rows, err := db.SQL.Query(`SELECT id,name,type,is_default, disable_resolve_message, send_reminder, upload_image, settings FROM alert_notification WHERE team_id=?`, teamId)
	if err != nil {
		logger.Warn("get alert notification error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	notifications := make([]*models.AlertNotification, 0)
	for rows.Next() {
		n := &models.AlertNotification{}
		var rawSetting []byte
		err := rows.Scan(&n.Id, &n.Name, &n.Type, &n.IsDefault, &n.DisableResolveMessage, &n.SendReminder, &n.UploadImage, &rawSetting)
		if err != nil {
			logger.Warn("scan alerting notification error", "error", err)
			continue
		}

		setting := simplejson.New()
		err = setting.UnmarshalJSON(rawSetting)
		if err != nil {
			logger.Warn("unmarshal alerting notification setting error", "error", err)
			continue
		}

		n.Settings = setting
		n.TeamId = teamId

		notifications = append(notifications, n)
	}

	c.JSON(200, common.ResponseSuccess(notifications))
}

func TestNotification(c *gin.Context) {
	model := &models.AlertNotification{}
	c.Bind(&model)

	notifier := newNotificationService()

	notifiers, err := InitNotifier(model)
	if err != nil {
		logger.Error("Failed to create notifier", "error", err.Error())
		c.JSON(400, common.ResponseI18nError("error.buildNotifierError"))
		return
	}

	err = notifier.sendNotifications(createTestEvalContext(), notifierStateSlice{{notifier: notifiers}})
	if err != nil {
		c.JSON(400, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}
}

func createTestEvalContext() *models.EvalContext {
	testRule := &models.Rule{
		DashboardID: 1,
		PanelID:     1,
		Name:        "Test notification",
		Message:     "Someone is testing the alert notification within Grafana.",
		State:       models.AlertStateAlerting,
	}

	ctx := models.NewEvalContext(context.Background(), testRule, logger, make(map[string]*models.AlertState))
	ctx.IsTestRun = true
	ctx.Error = fmt.Errorf("This is only a test")
	ctx.EvalMatches = evalMatchesBasedOnState()

	return ctx
}

func evalMatchesBasedOnState() []*models.EvalMatch {
	matches := make([]*models.EvalMatch, 0)
	matches = append(matches, &models.EvalMatch{
		Firing: true,
		Metric: "Low value",
		Value:  null.FloatFrom(100),
	})

	matches = append(matches, &models.EvalMatch{
		Firing: true,
		Metric: "Higher Value",
		Value:  null.FloatFrom(200),
	})

	return matches
}

type TestRuleReq struct {
	Dashboard *simplejson.Json
	PanelID   int64
}

type AlertTestResult struct {
	Firing         bool                         `json:"firing"`
	State          models.AlertStateType        `json:"state"`
	ConditionEvals string                       `json:"conditionEvals"`
	TimeMs         string                       `json:"timeMs"`
	Error          string                       `json:"error,omitempty"`
	EvalMatches    []*models.EvalMatch          `json:"matches,omitempty"`
	Logs           []*models.AlertTestResultLog `json:"logs,omitempty"`
}

func TestRule(c *gin.Context) {
	req := &TestRuleReq{}
	c.Bind(&req)

	dash := models.NewDashboardFromJson(req.Dashboard)
	extractor := &DashAlertExtractor{dash}
	alerts, err := extractor.GetAlerts()
	if err != nil {
		logger.Warn("get alerts error", "error", err)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	for _, alert := range alerts {
		if alert.PanelId == req.PanelID {
			rule, err := NewRuleFromDBAlert(alert)
			if err != nil {
				logger.Warn("get alert rule error", "error", err)
				c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
				return
			}

			res := testAlertRule(rule)

			resp := &AlertTestResult{
				Firing:         res.EvalMatches[0].Firing,
				ConditionEvals: res.ConditionEvals,
				State:          res.Rule.State,
			}

			if res.Error != nil {
				resp.Error = res.Error.Error()
			}

			for _, log := range res.Logs {
				resp.Logs = append(resp.Logs, &models.AlertTestResultLog{Message: log.Message, Data: log.Data})
			}

			for _, match := range res.EvalMatches {
				resp.EvalMatches = append(resp.EvalMatches, &models.EvalMatch{Metric: match.Metric, Value: match.Value})
			}

			resp.TimeMs = fmt.Sprintf("%1.3fms", res.GetDurationMs())

			c.JSON(200, common.ResponseSuccess(resp))
			return
		}
	}

	c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
}

func testAlertRule(rule *models.Rule) *models.EvalContext {
	handler := NewEvalHandler()

	context := models.NewEvalContext(context.Background(), rule, logger, make(map[string]*models.AlertState))
	context.IsTestRun = true
	context.IsDebug = true

	handler.Eval(context)
	context.SetNewStates()

	return context
}

func GetDashboardState(c *gin.Context) {
	dashId, _ := strconv.ParseInt(c.Param("dashId"), 10, 64)
	if dashId == 0 {
		common.ResponseI18nError(i18n.BadRequestData)
		return
	}

	res := make(map[int64]string)
	rows, err := db.SQL.Query("SELECT panel_id,state FROM alert WHERE dashboard_id=?", dashId)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get dashboard alert error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	for rows.Next() {
		var pid int64
		var state string
		err := rows.Scan(&pid, &state)
		if err != nil {
			logger.Warn("scan dashboard state error", "error", err)
			c.JSON(500, common.ResponseInternalError())
			return
		}

		res[pid] = state
	}

	c.JSON(200, common.ResponseSuccess(res))
}
