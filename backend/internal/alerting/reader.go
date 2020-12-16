package alerting

import (
	"sync"

	"github.com/opendatav/datav/backend/internal/cache"

	"github.com/opendatav/datav/backend/pkg/models"
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

	alerts := cache.Alerts
	for _, ruleDef := range alerts {
		if model, err := NewRuleFromDBAlert(ruleDef); err != nil {
			logger.Error("Could not build alert model for rule", "ruleId", ruleDef.Id, "error", err)
		} else {
			res = append(res, model)
		}
	}

	return res
}
