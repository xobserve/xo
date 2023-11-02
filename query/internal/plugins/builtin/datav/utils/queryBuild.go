package utils

import (
	"fmt"
	"strings"

	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
)

func BuildBasicDomainQuery(tenant string, params map[string]interface{}) string {
	domainQuery := fmt.Sprintf(" tenant='%s'", tenant)

	namespace := GetValueListFromParams(params, "namespace")
	if namespace != nil {
		domainQuery += fmt.Sprintf(" AND namespace in ('%s')", strings.Join(namespace, "','"))
	} else {
		domainQuery += fmt.Sprintf(" AND namespace='%s'", datavmodels.DefaultNamespace)
	}
	group := GetValueListFromParams(params, "group")
	if group != nil {
		domainQuery += fmt.Sprintf(" AND group in ('%s')", strings.Join(group, "','"))
	} else {
		domainQuery += fmt.Sprintf(" AND group='%s'", datavmodels.DefaultGroup)
	}

	return domainQuery
}
