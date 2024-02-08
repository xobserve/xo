package accesstoken

import (
	"context"
	"errors"
	"strconv"

	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func CanViewDashboard(teamId int64, dashId string, tokenStr string) (bool, error) {
	token, err := models.GetAccessToken(0, tokenStr)
	if err != nil {
		return false, errors.New("invalid token")
	}
	if token.Mode == common.WriteOnlyMode {
		return false, errors.New("invalid token")
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
