package accesstoken

import (
	"context"
	"errors"
	"strconv"

	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
)

func CanManageTeam(teamId int64, tokenStr string) (bool, error) {
	token, err := models.GetAccessToken(0, tokenStr)
	if err != nil {
		return false, errors.New(e.InvalidToken)
	}
	if token.Mode != common.ManageMode {
		return false, errors.New(e.InvalidTokenMode)
	}

	if token.Scope == common.ScopeDashboard {
		return false, errors.New(e.InvalidToken)
	}

	if token.Scope == common.ScopeWebsite {
		return true, nil
	}

	if token.Scope == common.ScopeTenant {
		tenantId, _ := strconv.ParseInt(token.ScopeId, 10, 64)
		tid, err := models.QueryTenantIdByTeamId(context.Background(), teamId)
		if err != nil {
			return false, err
		}

		if tid != tenantId {
			return false, errors.New("invalid token")
		}

		return true, nil
	}

	if token.Scope == common.ScopeTeam {
		id, _ := strconv.ParseInt(token.ScopeId, 10, 64)
		return id == teamId, nil
	}

	return false, nil
}

func CanManageWebsite(tokenStr string) (bool, error) {
	token, err := models.GetAccessToken(0, tokenStr)
	if err != nil {
		return false, errors.New(e.InvalidToken)
	}
	if token.Mode != common.ManageMode {
		return false, errors.New(e.InvalidTokenMode)
	}

	if token.Scope == common.ScopeWebsite {
		return true, nil
	}

	return false, nil
}

func CanManageTenant(tenantId int64, tokenStr string) (bool, error) {
	token, err := models.GetAccessToken(0, tokenStr)
	if err != nil {
		return false, errors.New(e.InvalidToken)
	}
	if token.Mode != common.ManageMode {
		return false, errors.New(e.InvalidTokenMode)
	}

	if token.Scope == common.ScopeWebsite {
		return true, nil
	}

	if token.Scope == common.ScopeTenant {
		id, _ := strconv.ParseInt(token.ScopeId, 10, 64)
		return id == tenantId, nil
	}

	return false, nil
}
