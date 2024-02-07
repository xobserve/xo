package models

import (
	"strconv"
	"strings"
)

func GetDashboardIdFromScopeId(scopeId int64) (int64, string) {
	ids := strings.Split(strconv.FormatInt(scopeId, 10), ":")
	teamId, _ := strconv.ParseInt(ids[0], 10, 64)
	return teamId, ids[1]
}
