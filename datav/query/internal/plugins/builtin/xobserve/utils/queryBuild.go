package utils

import (
	"fmt"
	"strings"
)

func BuildBasicDomainQuery(teamId int64, params map[string]interface{}) string {
	domainQuery := fmt.Sprintf(" teamId='%d'", teamId)

	cluster := GetValueListFromParams(params, "cluster")
	if cluster != nil {
		domainQuery += fmt.Sprintf(" AND cluster in ('%s')", strings.Join(cluster, "','"))
	}

	namespace := GetValueListFromParams(params, "namespace")
	if namespace != nil {
		domainQuery += fmt.Sprintf(" AND namespace in ('%s')", strings.Join(namespace, "','"))
	}

	return domainQuery
}
