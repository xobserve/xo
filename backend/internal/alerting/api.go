package alerting

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/savecost/datav/backend/internal/cache"

	_ "github.com/savecost/datav/backend/pkg/tsdb"

	"github.com/gin-gonic/gin"
	"github.com/savecost/datav/backend/internal/acl"
	"github.com/savecost/datav/backend/internal/session"
	"github.com/savecost/datav/backend/pkg/common"
	"github.com/savecost/datav/backend/pkg/db"
	"github.com/savecost/datav/backend/pkg/i18n"
	"github.com/savecost/datav/backend/pkg/models"
	"github.com/savecost/datav/backend/pkg/utils/null"
	"github.com/savecost/datav/backend/pkg/utils/simplejson"
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

	notifierService := newNotificationService()

	notifier, err := InitNotifier(model)
	if err != nil {
		logger.Error("Failed to create notifier", "error", err.Error())
		c.JSON(400, common.ResponseI18nError("error.buildNotifierError"))
		return
	}

	err = notifierService.sendNotification(createTestEvalContext(), []Notifier{notifier})
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

func GetHistory(c *gin.Context) {
	tp := c.Query("type")
	teamId, _ := strconv.ParseInt(c.Query("teamId"), 10, 64)
	dashId, _ := strconv.ParseInt(c.Query("dashId"), 10, 64)
	panelId, _ := strconv.ParseInt(c.Query("panelId"), 10, 64)
	limit, _ := strconv.ParseInt(c.Query("limit"), 10, 64)
	stateFilter := c.Query("stateFilter")

	if limit == 0 {
		limit = 50
	}

	histories := make(models.AlertHistories, 0)
	var rows *sql.Rows
	var err error
	switch tp {
	case "panel":
		rows, err = db.SQL.Query("SELECT id,dashboard_id,panel_id,state,matches,created,alert_name FROM alert_history WHERE dashboard_id=? and panel_id=? order by created desc limit ?",
			dashId, panelId, limit)
	case "team":
		var q string
		if teamId == 0 {
			// get all dashboards of all teams
			q = fmt.Sprintf("SELECT id,dashboard_id,panel_id,state,matches,created,alert_name FROM alert_history order by created desc limit %d", limit)
		} else {
			// get team dashboards
			dashboards, err := models.QueryDashboardsByTeamId(teamId)
			if err != nil && err != sql.ErrNoRows {
				logger.Warn("get team dashboard error", "error", err)
				c.JSON(500, common.ResponseInternalError())
				return
			}

			if err == sql.ErrNoRows {
				c.JSON(200, common.ResponseSuccess(histories))
				return
			}

			dashIds := make([]string, 0)
			for _, dash := range dashboards {
				dashIds = append(dashIds, strconv.FormatInt(dash.Id, 10))
			}

			dashIdStr := strings.Join(dashIds, "','")
			q = fmt.Sprintf("SELECT id,dashboard_id,panel_id,state,matches,created,alert_name FROM alert_history WHERE dashboard_id in ('%s') order by created desc limit %d",
				dashIdStr, limit)
		}

		rows, err = db.SQL.Query(q)
	default:
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get alert history error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if err == sql.ErrNoRows {
		c.JSON(200, common.ResponseSuccess(histories))
		return
	}

	for rows.Next() {
		ah := &models.AlertHistory{}
		var matches []byte
		var created time.Time
		err := rows.Scan(&ah.ID, &ah.DashboardID, &ah.PanelID, &ah.State, &matches, &created, &ah.AlertName)
		if err != nil {
			logger.Warn("scan alert history error", "error", err)
			continue
		}

		err = json.Unmarshal(matches, &ah.Matches)
		if err != nil {
			logger.Warn("unmarshl alert history matches error", "error", err)
			continue
		}

		ah.Time = created.UnixNano() / 1e6
		ah.TimeUnix = created.Unix()

		// for _, alert := range cache.Alerts {
		// 	if alert.DashboardId == ah.DashboardID && alert.PanelId == ah.PanelID {
		// 		ah.AlertName = alert.Name

		// }

		dash, ok := cache.Dashboards[ah.DashboardID]
		if ok {
			ah.DashboardUrl = fmt.Sprintf("/d/%s/%s", dash.Uid, dash.Slug)
			ah.TeamId = dash.OwnedBy
		}

		if stateFilter == "" || stateFilter == "all" || stateFilter == string(ah.State) {
			histories = append(histories, ah)
		}
	}

	sort.Sort(histories)
	c.JSON(200, common.ResponseSuccess(histories))
	return
}

type FilterHistoryReq struct {
	MaxItems  int                  `json:"maxItems"`
	SortOrder int                  `json:"sortOrder"`
	Teams     []int64              `json:"teams"`
	Filter    *FilterHistoryFilter `json:"filter"`
	From      int64                `json:"from"`
	To        int64                `json:"to"`
	DashUID   string               `json:"dahUID"`
}

type FilterHistoryFilter struct {
	OK       bool `json:"ok"`
	Alerting bool `json:"alerting"`
}

func FilterHistory(c *gin.Context) {
	req := &FilterHistoryReq{}
	c.Bind(&req)

	if req.MaxItems <= 0 {
		req.MaxItems = 10
	}

	if req.SortOrder != 1 && req.SortOrder != 2 {
		req.SortOrder = 1
	}

	dashIDs := make([]int64, 0)
	// first filter the dashboards by uids
	uids := strings.Split(req.DashUID, ",")
	if len(uids) != 0 {
		for _, uid := range uids {
			dashID := models.QueryDashIDByUID(uid)
			if dashID != 0 {
				dashIDs = append(dashIDs, dashID)
			}
		}
	}

	if len(dashIDs) == 0 {
		// second filter the dashboard by teamids
		for _, teamId := range req.Teams {
			if teamId == 0 {
				for id := range cache.Dashboards {
					dashIDs = append(dashIDs, id)
				}
			} else {
				dashes, _ := models.QueryDashboardsByTeamId(teamId)
				if len(dashes) > 0 {
					for _, dash := range dashes {
						dashIDs = append(dashIDs, dash.Id)
					}
				}
			}
		}
	}

	// get all alerts history, then sort them by sortOrder
	histories := make(models.AlertHistories, 0)
	for _, dashID := range dashIDs {
		var rows *sql.Rows
		var err error
		if req.From != 0 {
			from := time.Unix(req.From, 0)
			to := time.Unix(req.To, 0)
			rows, err = db.SQL.Query("SELECT id,dashboard_id,panel_id,state,created,alert_name FROM alert_history WHERE dashboard_id=? and created >= ? and created <= ? order by created desc limit ?", dashID, from, to, req.MaxItems)
		} else {
			rows, err = db.SQL.Query("SELECT id,dashboard_id,panel_id,state,created,alert_name FROM alert_history WHERE dashboard_id=? order by created desc limit ?", dashID, req.MaxItems)
		}

		if err != nil {
			if err != sql.ErrNoRows {
				logger.Warn("query alert history error", "error", err)
			}
			continue
		}

		for rows.Next() {
			ah := &models.AlertHistory{}
			var created time.Time
			err := rows.Scan(&ah.ID, &ah.DashboardID, &ah.PanelID, &ah.State, &created, &ah.AlertName)
			if err != nil {
				logger.Warn("scan alert history error", "error", err)
				continue
			}

			ah.Time = created.UnixNano() / 1e6
			ah.TimeUnix = created.Unix()

			alertExist := false
			for _, alert := range cache.Alerts {
				if alert.DashboardId == ah.DashboardID && alert.PanelId == ah.PanelID {
					alertExist = true
				}
			}

			if !alertExist {
				// alert has been removed, but history has not
				continue
			}

			dash, ok := cache.Dashboards[ah.DashboardID]
			if ok {
				ah.DashboardUrl = fmt.Sprintf("/d/%s/%s", dash.Uid, dash.Slug)
				ah.TeamId = dash.OwnedBy
			}

			histories = append(histories, ah)
		}
	}

	sort.Sort(histories)

	if req.MaxItems < len(histories) {
		histories = histories[:req.MaxItems]
	}

	c.JSON(200, common.ResponseSuccess(histories))
}

type DashboardAlertRule struct {
	ID           int64     `json:"id"`
	TeamId       int64     `json:"teamId"`
	Name         string    `json:"name"`
	State        string    `json:"state"`
	NewStateDate time.Time `json:"newStateDate"`
	DashId       int64     `json:"dashboardId"`
	DashUid      string    `json:"dashboardUid"`
	DashSlug     string    `json:"dashboardSlug"`
	PanelId      int64     `json:"panelId"`
}

func GetRules(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Query("teamId"), 10, 64)
	stateFilter := c.Query("stateFilter")

	rules := make([]*DashboardAlertRule, 0)
	if teamId != 0 {
		// get team dashboards
		dashboards, err := models.QueryDashboardsByTeamId(teamId)
		if err != nil && err != sql.ErrNoRows {
			logger.Warn("get team dashboard error", "error", err)
			c.JSON(500, common.ResponseInternalError())
			return
		}

		if err == sql.ErrNoRows {
			c.JSON(200, common.ResponseSuccess(rules))
			return
		}

		for _, dash := range dashboards {
			rows, err := db.SQL.Query("SELECT id,panel_id, name, state,new_state_date FROM alert WHERE dashboard_id=?", dash.Id)
			if err != nil {
				if err != sql.ErrNoRows {
					logger.Warn("get alert rules by dashboard error", "error", err)
				}
				continue
			}

			for rows.Next() {
				dar := &DashboardAlertRule{
					DashId:   dash.Id,
					DashUid:  dash.Uid,
					DashSlug: dash.Slug,
					TeamId:   teamId,
				}

				err := rows.Scan(&dar.ID, &dar.PanelId, &dar.Name, &dar.State, &dar.NewStateDate)
				if err != nil {
					logger.Warn("get dashboard alert rule scan error", "eror", err)
					continue
				}

				if stateFilter == string(models.AlertStateAll) || stateFilter == dar.State {
					rules = append(rules, dar)
				}
			}
		}

	} else {
		// get all rules
		rows, err := db.SQL.Query("SELECT id,panel_id,dashboard_id,name, state,new_state_date FROM alert")
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(200, common.ResponseSuccess(rules))
			} else {
				logger.Warn("get team dashboard error", "error", err)
				c.JSON(500, common.ResponseInternalError())
			}
			return

		}

		for rows.Next() {
			dar := &DashboardAlertRule{}

			err := rows.Scan(&dar.ID, &dar.PanelId, &dar.DashId, &dar.Name, &dar.State, &dar.NewStateDate)
			if err != nil {
				logger.Warn("get dashboard alert rule scan error", "eror", err)
				continue
			}

			dash, ok := cache.Dashboards[dar.DashId]
			if ok {
				dar.DashUid = dash.Uid
				dar.DashSlug = dash.Slug
				dar.TeamId = dash.OwnedBy
			}

			if stateFilter == string(models.AlertStateAll) || stateFilter == dar.State {
				rules = append(rules, dar)
			}
		}
	}

	c.JSON(200, common.ResponseSuccess(rules))
}

type PauseAlertReq struct {
	AlertId int64 `json:"alertId"`
	Paused  bool  `json:"paused"`
}

func PauseAlert(c *gin.Context) {
	req := &PauseAlertReq{}
	c.Bind(&req)

	alert, err := GetAlert(req.AlertId)
	if err != nil {
		c.JSON(500, common.ResponseInternalError())
		return
	}

	// operator must be global admin or admin of team that alert belongs to
	if !acl.IsGlobalAdmin(c) {
		dashboard, err := models.QueryDashboard(alert.DashboardId)
		if err != nil {
			logger.Warn("get  dashboard error", "error", err)
			c.JSON(500, common.ResponseInternalError())
			return
		}

		if !acl.IsTeamAdmin(dashboard.OwnedBy, c) {
			c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
			return
		}
	}

	newState := models.AlertStateOK
	if req.Paused {
		newState = models.AlertStatePaused
	}

	_, err = db.SQL.Exec("UPDATE alert SET state=?, new_state_date=? WHERE id=?", newState, time.Now(), req.AlertId)
	if err != nil {
		logger.Warn("update alert state error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(newState))
}
