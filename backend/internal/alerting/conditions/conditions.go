package conditions

import (
	"github.com/CodeCreatively/datav/backend/pkg/models"
	"github.com/CodeCreatively/datav/backend/pkg/utils/simplejson"
)

// ConditionFactory is the function signature for creating `Conditions`.
type ConditionFactory func(model *simplejson.Json, index int) (models.Condition, error)

var Factories = make(map[string]ConditionFactory)

// RegisterCondition adds support for alerting conditions.
func RegisterCondition(typeName string, factory ConditionFactory) {
	Factories[typeName] = factory
}
