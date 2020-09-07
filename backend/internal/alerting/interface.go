package alerting

// ConditionResult is the result of a condition evaluation.
type ConditionResult struct {
	Firing      bool
	NoDataFound bool
	Operator    string
	EvalMatches []*EvalMatch
}

// Condition is responsible for evaluating an alert condition.
type Condition interface {
	Eval(result *EvalContext) (*ConditionResult, error)
}
