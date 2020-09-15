package alerting

import (
	"time"

	"github.com/code-creatively/datav/backend/pkg/models"
)

type evalHandler interface {
	Eval(evalContext *models.EvalContext)
}

// DefaultEvalHandler is responsible for evaluating the alert rule.
type DefaultEvalHandler struct {
	alertJobTimeout time.Duration
}

// NewEvalHandler is the `DefaultEvalHandler` constructor.
func NewEvalHandler() *DefaultEvalHandler {
	return &DefaultEvalHandler{
		alertJobTimeout: time.Second * 5,
	}
}

// Eval evaluated the alert rule.
func (e *DefaultEvalHandler) Eval(context *models.EvalContext) {
	metrics := make(map[string]*models.EvalMatch)
	for i := 0; i < len(context.Rule.Conditions); i++ {
		condition := context.Rule.Conditions[i]
		//@todo: 这里每个条件都会执行一次查询语句，效率过于低下
		cr, err := condition.Eval(context)
		if err != nil {
			context.Error = err
		}

		// break if condition could not be evaluated
		if context.Error != nil {
			break
		}

		for _, match := range cr.EvalMatches {
			metric, ok := metrics[match.Metric]
			if !ok {
				metrics[match.Metric] = metric
				continue
			}

			// calculating Firing based on operator
			if cr.Operator == "or" {
				metric.Firing = metric.Firing || match.Firing
				metric.NoDataFound = metric.NoDataFound || match.NoDataFound
			} else {
				metric.Firing = metric.Firing && match.Firing
				metric.NoDataFound = metric.NoDataFound && match.NoDataFound
			}
		}
	}

	for _, metric := range metrics {
		context.EvalMatches = append(context.EvalMatches, metric)
	}

	context.EndTime = time.Now()
}
