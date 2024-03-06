package acl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
)

func CanEditAnnotation(ctx context.Context, teamId int64, dashboardId string, u *models.User) error {
	dash, err := models.QueryDashboard(ctx, teamId, dashboardId)
	if err != nil {
		return fmt.Errorf("query dashboard error: %w", err)
	}

	enableAnnotation, err := dash.Data.Get("annotation").Get("enable").Bool()
	if err != nil {
		return fmt.Errorf("get annotation enable err: %w", err)
	}

	if !enableAnnotation {
		return errors.New("dashboard annotation disabled")
	}

	enableRole, err := dash.Data.Get("annotation").Get("enableRole").String()
	if err != nil {
		return fmt.Errorf("get annotation enable role err: %w", err)
	}

	teamMember, err := models.QueryTeamMember(ctx, dash.OwnedBy, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New(e.NotTeamMember)
		}

		return fmt.Errorf("query team member err: %w", err)
	}

	if enableRole == models.ROLE_ADMIN {
		if !teamMember.Role.IsAdmin() {
			return errors.New(e.NeedTeamAdmin)
		}
	}

	return nil

}

func CanEditDashboard(ctx context.Context, dash *models.Dashboard, u *models.User) error {
	return CanEditTeam(ctx, dash.OwnedBy, u.Id)
}
