package acl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
)

func CanViewTenant(ctx context.Context, tenantId int64, userId int64) error {
	_, err := models.QueryTenantUser(ctx, tenantId, userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New(e.NotTenantUser)
		}

		return fmt.Errorf("query tenant user err: %w", err)
	}

	return nil
}

func CanEditTenant(ctx context.Context, tenantId int64, userId int64) error {
	tenantUser, err := models.QueryTenantUser(ctx, tenantId, userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New(e.NotTenantUser)
		}
		return fmt.Errorf("query tenant user error: %w", err)
	}

	if !tenantUser.Role.IsAdmin() {
		return errors.New(e.NeedTenantAdmin)
	}

	return nil
}
