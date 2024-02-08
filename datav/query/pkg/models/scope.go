package models

import (
	"strconv"
	"strings"
)

func GetDashboardIdFromScopeId(scopeId string) (int64, string) {
	ids := strings.Split(scopeId, ":")
	teamId, _ := strconv.ParseInt(ids[0], 10, 64)
	return teamId, ids[1]
}

func ConvertDashIdToScopeId(teamId int64, dashId string) string {
	return strconv.FormatInt(teamId, 10) + ":" + dashId
}
