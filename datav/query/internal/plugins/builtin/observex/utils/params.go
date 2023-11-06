package utils

import (
	"strings"

	observexmodels "github.com/DataObserve/observex/query/internal/plugins/builtin/observex/models"
	"github.com/DataObserve/observex/query/pkg/models"
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
			value = strings.Split(valueS, observexmodels.VariableSplitChart)
		}
	}

	return value
}
