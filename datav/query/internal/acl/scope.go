package acl

import (
	"context"
	"strconv"

	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/models"
)

// Dont use access token here in the future, because we will use this function to check if the user has the right to edit the access token
func CanEditScope(ctx context.Context, scope int, scopeId string, u *models.User) error {
	if scope == common.ScopeWebsite {
		if err := CanEditWebsite(u); err != nil {
			return err
		}
		return nil
	}

	if scope == common.ScopeTenant {
		id, _ := strconv.ParseInt(scopeId, 10, 64)
		if err := CanEditTenant(ctx, id, u.Id); err != nil {
			return err
		}
		return nil
	}

	if scope == common.ScopeTeam {
		id, _ := strconv.ParseInt(scopeId, 10, 64)
		if err := CanEditTeam(ctx, id, u.Id); err != nil {
			return err
		}
		return nil
	}

	if scope == common.ScopeDashboard {
		teamId, dashId := models.GetDashboardIdFromScopeId(scopeId)
		err := models.IsDashboardExist(ctx, teamId, dashId)
		if err != nil {
			return err
		}

		if err := CanEditTeam(ctx, teamId, u.Id); err != nil {
			return err
		}
	}

	return nil
}
