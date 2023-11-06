package utils

import (
	"fmt"
	"strings"

	xobservemodels "github.com/xObserve/xObserve/query/internal/plugins/builtin/xobserve/models"
)

func BuildBasicDomainQuery(tenant string, params map[string]interface{}) string {
	domainQuery := fmt.Sprintf(" tenant='%s'", tenant)

	namespace := GetValueListFromParams(params, "namespace")
	if namespace != nil {
		domainQuery += fmt.Sprintf(" AND namespace in ('%s')", strings.Join(namespace, "','"))
	} else {
		domainQuery += fmt.Sprintf(" AND namespace='%s'", xobservemodels.DefaultNamespace)
	}
	group := GetValueListFromParams(params, "group")
	if group != nil {
		domainQuery += fmt.Sprintf(" AND group in ('%s')", strings.Join(group, "','"))
	} else {
		domainQuery += fmt.Sprintf(" AND group='%s'", xobservemodels.DefaultGroup)
	}

	return domainQuery
}
