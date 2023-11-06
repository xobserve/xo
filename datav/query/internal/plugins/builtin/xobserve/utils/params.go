package utils

import (
	"strings"

	xobservemodels "github.com/xObserve/xObserve/query/internal/plugins/builtin/xobserve/models"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func GetValueFromParams(params map[string]interface{}, key string) string {
	valueI := params[key]
	if valueI != nil {
		valueS := valueI.(string)
		if strings.TrimSpace(valueS) == "" {
			return ""
		}
		return valueS
	}

	return ""
}

func GetValueListFromParams(params map[string]interface{}, key string) []string {
	valueI := params[key]
	var value []string
	if valueI != nil {
		valueS := valueI.(string)
		if strings.TrimSpace(valueS) == "" {
			return nil
		}
		if valueS != models.VarialbeAllOption {
			value = strings.Split(valueS, xobservemodels.VariableSplitChart)
		}
	}

	return value
}
