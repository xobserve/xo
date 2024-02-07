package acl

import (
	"context"

	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func CanEditScope(ctx context.Context, scope int, scopeId int64, u *models.User) error {
	if scope == common.ScopeWebsite {
		if err := CanEditWebsite(u); err != nil {
			return err
		}
		return nil
	}

	if scope == common.ScopeTenant {
		if err := CanEditTenant(ctx, scopeId, u.Id); err != nil {
			return err
		}
		return nil
	}

	if scope == common.ScopeTeam {
		if err := CanEditTeam(ctx, scopeId, u.Id); err != nil {
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
