package alerting

import (
	"sync"

	"github.com/code-creatively/datav/backend/pkg/models"
)

type ruleReader interface {
	fetch() []*models.Rule
}

type defaultRuleReader struct {
	sync.RWMutex
}

func newRuleReader() *defaultRuleReader {
	ruleReader := &defaultRuleReader{}

	return ruleReader
}

func (arr *defaultRuleReader) fetch() []*models.Rule {
	res := make([]*models.Rule, 0)

	alerts, err := GetAllAlerts()
	if err != nil {
		return res
	}

	for _, ruleDef := range alerts {
		if model, err := NewRuleFromDBAlert(ruleDef); err != nil {
			logger.Error("Could not build alert model for rule", "ruleId", ruleDef.Id, "error", err)
		} else {
			res = append(res, model)
		}
	}

	return res
}
