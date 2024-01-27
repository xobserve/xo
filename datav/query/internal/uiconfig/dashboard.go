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
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/internal/variables"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func GetDashboardConfig(c *gin.Context) {
	rawpath := strings.TrimSpace(c.Query("path"))
	path := strings.TrimSpace(c.Query("path"))
	teamId0, _ := strconv.ParseInt(c.Query("teamId"), 10, 64)
	var tenantId int64
	var teamId int64
	u := user.CurrentUser(c)
	cfg := GetBasicConfig()

	var dashboard *models.Dashboard
	var sidemenu *models.SideMenu
	if strings.HasPrefix(path, "/"+models.DashboardIdPrefix) { // access dashboard by id
		id := path[1:]
		dash, err := models.QueryDashboard(c.Request.Context(), teamId0, id)
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
		sidemenu, err = models.QuerySideMenu(c.Request.Context(), teamId, nil)
		if err != nil {
			if err != sql.ErrNoRows {
				logger.Warn("query sidemenu error", "error", err)
				c.JSON(500, common.RespError(err.Error()))
				return
			}
		}
	} else { // access dashboard in sidemenu
		var err error
		tenantId, teamId, err = getUserRealTeam(teamId0, u, c.Request.Context())
		if err != nil {
			if err.Error() == e.UnsignUserError {
				c.JSON(401, common.RespError(e.UnsignUserError))
				return
			}
			c.JSON(400, common.RespError(err.Error()))
			return
		}

		sidemenu, err = models.QuerySideMenu(c.Request.Context(), teamId, nil)
		if err != nil {
			if err != sql.ErrNoRows {
				logger.Warn("query sidemenu error", "error", err)
				c.JSON(500, common.RespError(err.Error()))
				return
			}
		}
		menuItems := sidemenu.Data
		if len(menuItems) == 0 {
			c.JSON(200, common.RespSuccess(map[string]interface{}{
				"cfg":    cfg,
				"path":   fmt.Sprintf("/%d/cfg/team/sidemenu", teamId),
				"reload": true,
			}))
			return
		}

		var dashId string
		if teamId0 == 0 || path == "" || path == "/" {
		LOOP0:
			for _, m1 := range menuItems {
				if len(m1) > 0 {
					for _, m := range m1 {
						if m.DashboardId != "" && m.Url != "" {
							dashId = m.DashboardId
							path = m.Url
							break LOOP0
						}

						for _, sub := range m.Children {
							if sub.DashboardId != "" && sub.Url != "" {
								dashId = m.DashboardId
								path = m.Url
								break LOOP0
							}
						}
					}
				}
			}
		} else {
		LOOP:
			for _, m1 := range menuItems {
				if len(m1) > 0 {
					for _, m := range m1 {
						if m.Url == path {
							dashId = m.DashboardId
							break LOOP
						}
						for _, sub := range m.Children {
							if sub.Url == path {
								dashId = m.DashboardId
								break LOOP
							}
						}
					}
				}
			}
		}

		dash, err := models.QueryDashboard(c.Request.Context(), teamId, dashId)

		if err != nil {
			if err == sql.ErrNoRows {
				cfg.Sidemenu = sidemenu
				cfg.CurrentTenant = tenantId
				cfg.CurrentTeam = teamId
				if rawpath == "/" || rawpath == "" {
					c.JSON(200, common.RespSuccess(map[string]interface{}{
						"cfg":    cfg,
						"path":   fmt.Sprintf("/%d%s", teamId, path),
						"reload": true,
					}))
					return
				}

				c.JSON(200, common.RespSuccess(map[string]interface{}{
					"cfg": cfg,
				}))
				// c.JSON(400, common.RespError(fmt.Sprintf("dashboard of team %d not exist", teamId)))
				return

			}
			logger.Warn("get dashboard error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
		dashboard = dash
	}

	if u == nil && (dashboard.VisibleTo == models.TeamVisible || dashboard.VisibleTo == models.TenantVisible) {
		c.JSON(401, common.RespError("you have to sign in to view this dashboard"))
		return
	}

	if dashboard.VisibleTo == models.TeamVisible {
		// check user is in team
		_, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(403, common.RespError(e.NotTeamMember))
				return
			}
			logger.Warn("query team member error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
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

	team, err := models.QueryTeam(c.Request.Context(), dashboard.OwnedBy, "")
	if err != nil {
		logger.Warn("query team error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	if team.Status == common.StatusDeleted {
		c.JSON(400, common.RespError(e.TeamBeenDeleted))
		return
	}

	teamList := models.Teams([]*models.Team{team})

	datasources, err := datasource.GetDatasourcesByTeamId(c.Request.Context(), dashboard.OwnedBy)
	if err != nil {
		logger.Warn("get datasources by team id error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	cfg.CurrentTenant = tenantId
	cfg.CurrentTeam = teamId
	cfg.Sidemenu = sidemenu

	// query tenant name
	tenant1, err := models.QueryTenant(c.Request.Context(), tenantId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError(e.TenantNotExist))
			return
		}
		logger.Warn("query tenant error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	cfg.TenantName = tenant1.Name
	if u != nil {
		tenantUser, err := models.QueryTenantUser(c.Request.Context(), tenantId, u.Id)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError("you are not in this tenant"))
				return
			}
			logger.Warn("query tenant user error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}
		cfg.TenantRole = tenantUser.Role
	} else {
		cfg.TenantRole = models.ROLE_VIEWER
	}

	// query team role
	if u != nil {
		teamUser, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
		if err != nil && err != sql.ErrNoRows {
			logger.Warn("query team user error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}
		if teamUser != nil {
			cfg.TeamRole = teamUser.Role

		}
	} else {
		cfg.TeamRole = models.ROLE_VIEWER
	}

	c.JSON(200, common.RespSuccess(map[string]interface{}{
		"cfg":         cfg,
		"dashboard":   dashboard,
		"teams":       teamList,
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
			return 0, 0, errors.New(e.UnsignUserError)
		} else {
			tenantId = u.CurrentTenant
			in, err := models.IsUserInTenant(u.Id, tenantId)
			if err != nil {
				return 0, 0, fmt.Errorf("check user in tenant error: %w", err)
			}

			if !in || !models.IsTenantExist(ctx, tenantId) {
				tenants, err := models.QueryTenantsByUserId(ctx, u.Id)
				if err != nil {
					return 0, 0, fmt.Errorf("query tenants user in error: %w", err)
				}

				if len(tenants) == 0 {
					return 0, 0, errors.New("you are not in any tenant now")
				}
				for _, t := range tenants {
					if t.NumTeams > 0 && t.Status != common.StatusDeleted {
						tenantId = t.Id
						break
					}
				}
			}

			teams, err := models.QueryTeamsUserInTenant(ctx, tenantId, u.Id)
			if err != nil {
				return 0, 0, fmt.Errorf("query tenant team ids error: %w", err)
			}

			if len(teams) == 0 {
				return 0, 0, fmt.Errorf("you are not in any team now of tenant: %d", tenantId)
			}

			teamId = teams[0].Id
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
