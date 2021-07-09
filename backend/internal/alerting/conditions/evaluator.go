package conditions

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/datav-io/datav/backend/pkg/models"

	"github.com/datav-io/datav/backend/pkg/utils/null"
	"github.com/datav-io/datav/backend/pkg/utils/simplejson"
)

var (
	defaultTypes = []string{"gt", "lt"}
	rangedTypes  = []string{"within_range", "outside_range"}
)

// AlertEvaluator evaluates the reduced value of a timeseries.
// Returning true if a timeseries is violating the condition
// ex: ThresholdEvaluator, NoValueEvaluator, RangeEvaluator
type AlertEvaluator interface {
	Eval(reducedValue null.Float) bool
	GetLabel() (string, string)
}

type noValueEvaluator struct{}

func (e *noValueEvaluator) Eval(reducedValue null.Float) bool {
	return !reducedValue.Valid
}

func (e *noValueEvaluator) GetLabel() (string, string) {
	return models.DefaultEvaluatorParamLabel, models.DefaultEvaluatorParamLabel
}

type thresholdEvaluator struct {
	Type       string
	Threshold  float64
	LabelName  string
	LabelValue string
}

type EvaluatorParam struct {
	LabelName  string    `json:"labelName"`
	LabelValue string    `json:"labelValue"`
	Value      []float64 `json:"value"`
}

func newThresholdEvaluator(typ string, model *simplejson.Json) ([]AlertEvaluator, error) {
	params := model.Get("params").MustArray()
	if len(params) == 0 || params[0] == nil {
		return nil, fmt.Errorf("Evaluator '%v' is missing the threshold parameter", HumanThresholdType(typ))
	}

	evaluators := make([]AlertEvaluator, 0)
	for _, paramI := range params {
		b, _ := json.Marshal(paramI)
		param := &EvaluatorParam{}
		err := json.Unmarshal(b, &param)
		if err != nil {
			return nil, errors.New("Evaluator has invalid range parameter")
		}

		rangedEval := &thresholdEvaluator{
			Type:       typ,
			LabelName:  param.LabelName,
			LabelValue: param.LabelValue,
			Threshold:  param.Value[0],
		}

		evaluators = append(evaluators, rangedEval)
	}

	return evaluators, nil
}

func (e *thresholdEvaluator) Eval(reducedValue null.Float) bool {
	if !reducedValue.Valid {
		return false
	}

	switch e.Type {
	case "gt":
		return reducedValue.Float64 > e.Threshold
	case "lt":
		return reducedValue.Float64 < e.Threshold
	}

	return false
}

func (e *thresholdEvaluator) GetLabel() (string, string) {
	return e.LabelName, e.LabelValue
}

type rangedEvaluator struct {
	Type       string
	LabelName  string
	LabelValue string
	Lower      float64
	Upper      float64
}

func newRangedEvaluator(typ string, model *simplejson.Json) ([]AlertEvaluator, error) {
	params := model.Get("params").MustArray()
	if len(params) == 0 {
		return nil, errors.New("Evaluator missing threshold parameter")
	}

	evaluators := make([]AlertEvaluator, 0)
	for _, paramI := range params {
		b, _ := json.Marshal(paramI)
		param := &EvaluatorParam{}
		err := json.Unmarshal(b, &param)
		if err != nil {
			return nil, errors.New("Evaluator has invalid range parameter")
		}

		rangedEval := &rangedEvaluator{
			Type:       typ,
			LabelName:  param.LabelName,
			LabelValue: param.LabelValue,
			Lower:      param.Value[0],
			Upper:      param.Value[1],
		}

		evaluators = append(evaluators, rangedEval)
	}

	return evaluators, nil
}

func (e *rangedEvaluator) Eval(reducedValue null.Float) bool {
	if !reducedValue.Valid {
		return false
	}

	floatValue := reducedValue.Float64

	switch e.Type {
	case "within_range":
		return (e.Lower < floatValue && e.Upper > floatValue) || (e.Upper < floatValue && e.Lower > floatValue)
	case "outside_range":
		return (e.Upper < floatValue && e.Lower < floatValue) || (e.Upper > floatValue && e.Lower > floatValue)
	}

	return false
}

func (e *rangedEvaluator) GetLabel() (string, string) {
	return e.LabelName, e.LabelValue
}

// NewAlertEvaluator is a factory function for returning
// an `AlertEvaluator` depending on the json model.
func NewAlertEvaluator(model *simplejson.Json) ([]AlertEvaluator, error) {
	typ := model.Get("type").MustString()
	if typ == "" {
		return nil, fmt.Errorf("Evaluator missing type property")
	}

	if inSlice(typ, defaultTypes) {
		evals, err := newThresholdEvaluator(typ, model)
		if err != nil {
			return nil, err
		}
		return evals, err
	}

	if inSlice(typ, rangedTypes) {
		evals, err := newRangedEvaluator(typ, model)
		if err != nil {
			return nil, err
		}
		return evals, err
	}

	if typ == "no_value" {
		return []AlertEvaluator{&noValueEvaluator{}}, nil
	}

	return nil, fmt.Errorf("Evaluator invalid evaluator type: %s", typ)
}

func inSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}

// HumanThresholdType converts a threshold "type" string to a string that matches the UI
// so errors are less confusing.
func HumanThresholdType(typ string) string {
	switch typ {
	case "gt":
		return "IS ABOVE"
	case "lt":
		return "IS BELOW"
	case "within_range":
		return "IS WITHIN RANGE"
	case "outside_range":
		return "IS OUTSIDE RANGE"
	}
	return ""
}
