package acl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
)

func CanViewTeam(ctx context.Context, teamId int64, userId int64) error {
	_, err := models.QueryTeamMember(ctx, teamId, userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New(e.NotTeamMember)
		}

		return fmt.Errorf("query team member err: %w", err)
	}

	return nil
}

func CanEditTeam(ctx context.Context, teamId int64, userId int64) error {
	member, err := models.QueryTeamMember(ctx, teamId, userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New(e.NotTeamMember)
		}

		return fmt.Errorf("query team member err: %w", err)
	}

	if !member.Role.IsAdmin() {
		return errors.New(e.NeedTeamAdmin)
	}

	return nil
}
