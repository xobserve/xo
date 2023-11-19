package uiconfig

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/datasource"
	"github.com/xObserve/xObserve/query/internal/teams"
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/internal/variables"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func GetDashboardConfig(c *gin.Context) {
	path := strings.TrimSpace(c.Query("path"))
	teamId0, _ := strconv.ParseInt(c.Query("teamId"), 10, 64)
	var tenantId int64
	var teamId int64
	u := user.CurrentUser(c)

	var dashboard *models.Dashboard
	var sidemenu *models.SideMenu
	if strings.HasPrefix(path, models.DashboardPrefix) {
		dash, err := models.QueryDashboard(c.Request.Context(), path)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError(fmt.Sprintf("dashboard %s not exist", path)))
				return
			}
			logger.Warn("get dashboard error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
		teamId = dash.OwnedBy
		tenantId, err = models.QueryTenantIdByTeamId(c.Request.Context(), teamId)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError("the tenant which the dashboard belongs to is not exist"))
				return
			}
			logger.Warn("get tenant id error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
		dashboard = dash
		sidemenu, err = models.QuerySideMenu(c.Request.Context(), teamId)
		if err != nil {
			if err != sql.ErrNoRows {
				logger.Warn("query sidemenu error", "error", err)
				c.JSON(500, common.RespError(err.Error()))
				return
			}
		}
	} else {
		var err error
		tenantId, teamId, err = getUserRealTeam(teamId0, u, c.Request.Context())
		if err != nil {
			logger.Warn("get user real team error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}

		sidemenu, err = models.QuerySideMenu(c.Request.Context(), teamId)
		if err != nil {
			if err != sql.ErrNoRows {
				logger.Warn("query sidemenu error", "error", err)
				c.JSON(500, common.RespError(err.Error()))
				return
			}
		}
		menuItems := sidemenu.Data
		if len(menuItems) == 0 {
			c.JSON(400, common.RespError("No dashboards in sidemenu"))
			return
		}

		var dashId string
		if teamId0 == 0 || path == "" || path == "/" {
			dashId = menuItems[0].DashboardId
			path = menuItems[0].Url
		} else {
			for _, m := range menuItems {
				if m.Url == path {
					dashId = m.DashboardId
					break
				}
			}
		}

		dash, err := models.QueryDashboard(c.Request.Context(), dashId)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError(fmt.Sprintf("the dashboard in path %s not exist", path)))
				return
			}
			logger.Warn("get dashboard error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
		dashboard = dash
	}

	if dashboard.VisibleTo == models.TeamVisible {
		// check user is in team
		member, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
		if err != nil {
			logger.Warn("query team member error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}

		if member.Id == 0 {
			c.JSON(403, common.RespError(e.NotTeamMember))
			return
		}
	} else if dashboard.VisibleTo == models.TenantVisible {
		// check user is in tenant
		in, err := models.IsUserInTenant(u.Id, tenantId)
		if err != nil {
			logger.Warn("check user in tenant error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}

		if !in {
			c.JSON(403, common.RespError(e.NotTenantUser))
			return
		}
	}

	vars, err := variables.GetTeamVariables(c.Request.Context(), dashboard.OwnedBy)
	if err != nil {
		logger.Warn("query variables error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	teams, err := teams.GetVisibleTeamsByTenantId(c.Request.Context(), tenantId, u)
	if err != nil {
		logger.Warn("get teams by tenant id error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	datasources, err := datasource.GetDatasourcesByTeamId(c.Request.Context(), dashboard.OwnedBy)
	if err != nil {
		logger.Warn("get datasources by team id error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	cfg := GetBasicConfig()
	cfg.CurrentTenant = tenantId
	cfg.CurrentTeam = teamId
	cfg.Sidemenu = sidemenu

	c.JSON(200, common.RespSuccess(map[string]interface{}{
		"cfg":         cfg,
		"dashboard":   dashboard,
		"teams":       teams,
		"datasources": datasources,
		"variables":   vars,
		"path":        path,
	}))
}

func getUserRealTeam(teamId0 int64, u *models.User, ctx context.Context) (int64, int64, error) {
	var tenantId int64
	var teamId int64

	if teamId0 == 0 {
		if u == nil {
			return 0, 0, errors.New("unsignin user can't visit root path")
		} else {
			tenantId = u.CurrentTenant
			in, err := models.IsUserInTenant(u.Id, tenantId)
			if err != nil {
				return 0, 0, fmt.Errorf("check user in tenant error: %w", err)
			}

			if !in {
				tenants, err := models.QueryTenantsByUserId(ctx, u.Id)
				if err != nil {
					return 0, 0, fmt.Errorf("query tenants user in error: %w", err)
				}
				if len(tenants) == 0 {
					return 0, 0, errors.New("you are not in any tenant now")
				}
				for _, t := range tenants {
					if t.NumTeams > 0 {
						tenantId = t.Id
						break
					}
				}
			}

			teams, err := models.QueryTenantTeamIds(tenantId)
			if err != nil {
				return 0, 0, fmt.Errorf("query tenant team ids error: %w", err)
			}

			if len(teams) == 0 {
				return 0, 0, errors.New("you are not in any team now")
			}

			teamId = teams[0]
		}
	} else {
		// check team id exist
		teamExist := models.IsTeamExist(ctx, teamId0)
		if !teamExist {
			return 0, 0, errors.New(e.TeamNotExist)
		}

		// query tenant id
		var err error
		tenantId, err = models.QueryTenantIdByTeamId(ctx, teamId0)
		if err != nil {
			if err == sql.ErrNoRows {
				return 0, 0, fmt.Errorf("Tenant not exist for team id =  %d", teamId0)
			}

			return 0, 0, fmt.Errorf("query tenant id by team id error: %w", err)
		}
		teamId = teamId0
	}

	return tenantId, teamId, nil
}
