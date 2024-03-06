package accesstoken

import (
	"context"
	"errors"
	"strconv"

	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/models"
)

func CanViewDashboard(teamId int64, dashId string, tokenStr string) (bool, error) {
	token, err := models.GetAccessToken(0, tokenStr)
	if err != nil {
		return false, errors.New("invalid token")
	}
	if token.Mode != common.ReadOnlyMode {
		return false, errors.New("invalid token ")
	}
	if token.Scope == common.ScopeWebsite {
		return true, nil
	}

	if token.Scope == common.ScopeDashboard && token.ScopeId == models.ConvertDashIdToScopeId(teamId, dashId) {
		return true, nil
	}

	if token.Scope == common.ScopeTeam {
		id, _ := strconv.ParseInt(token.ScopeId, 10, 64)
		return id == teamId, nil
	}

	if token.Scope == common.ScopeTenant {
		tenantId, _ := strconv.ParseInt(token.ScopeId, 10, 64)
		tid, err := models.QueryTenantIdByTeamId(context.Background(), teamId)
		if err != nil {
			return false, err
		}

		return tenantId == tid, nil
	}
	return false, nil
}

func CanViewTeam(teamId int64, tokenStr string) (bool, error) {
	token, err := models.GetAccessToken(0, tokenStr)
	if err != nil {
		return false, errors.New("invalid token")
	}
	if token.Mode != common.ReadOnlyMode {
		return false, errors.New("invalid token ")
	}

	if token.Scope == common.ScopeDashboard {
		return false, errors.New("dashboard scope token can't view team")
	}

	if token.Scope == common.ScopeWebsite {
		return true, nil
	}

	if token.Scope == common.ScopeTeam {
		id, _ := strconv.ParseInt(token.ScopeId, 10, 64)
		return id == teamId, nil
	}

	if token.Scope == common.ScopeTenant {
		tenantId, _ := strconv.ParseInt(token.ScopeId, 10, 64)
		tid, err := models.QueryTenantIdByTeamId(context.Background(), teamId)
		if err != nil {
			return false, err
		}

		return tenantId == tid, nil
	}
	return false, nil
}

func CanViewTeams(tenantId int64, tokenStr string) ([]int64, error) {
	token, err := models.GetAccessToken(0, tokenStr)
	if err != nil {
		return nil, errors.New("invalid token")
	}
	if token.Mode != common.ReadOnlyMode {
		return nil, errors.New("invalid token")
	}

	if token.Scope == common.ScopeDashboard {
		return nil, errors.New("invalid token")
	}

	if token.Scope == common.ScopeWebsite || token.Scope == common.ScopeTenant {
		ids, err := models.QueryTenantTeamIds(tenantId)
		return ids, err
	}

	if token.Scope == common.ScopeTeam {
		teamId, _ := strconv.ParseInt(token.ScopeId, 10, 64)
		tid, err := models.QueryTenantIdByTeamId(context.Background(), teamId)
		if err != nil {
			return nil, err
		}

		if tid != tenantId {
			return nil, errors.New("invalid token")
		}

		return []int64{teamId}, nil
	}

	return nil, nil
}
