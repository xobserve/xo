package utils

import (
	"strings"

	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	"github.com/DataObserve/datav/query/pkg/models"
)

func GetValueListFromParams(params map[string]interface{}, key string) []string {
	valueI := params[key]
	var value []string
	if valueI != nil {
		valueS := valueI.(string)
		if strings.TrimSpace(valueS) == "" {
			return nil
		}
		if valueS != models.VarialbeAllOption {
			value = strings.Split(valueS, datavmodels.VariableSplitChart)
		}
	}

	return value
}
