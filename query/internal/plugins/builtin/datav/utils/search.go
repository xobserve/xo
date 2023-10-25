package utils

import (
	"fmt"

	sb "github.com/huandu/go-sqlbuilder"
	lep "github.com/mgudov/logic-expression-parser"
)

func ParseSearchQuery(query string) (string, []interface{}, error) {
	result, err := lep.ParseExpression(query)
	if err != nil {
		return "", nil, err
	}

	sql := sb.NewSelectBuilder()
	where, err := traverse(sql, result)
	if err != nil {
		return "", nil, err
	}
	sql.Where(where)
	s, args := sql.Build()

	if s == "" {
		return "", nil, nil
	}

	return "AND " + s[5:], args, nil
}

func traverse(sql *sb.SelectBuilder, expr lep.Expression) (string, error) {
	switch e := expr.(type) {
	default:
		return "", fmt.Errorf("not implemented: %T", e)
	case *lep.OrX:
		var args []string
		for _, disjunction := range e.Disjunctions {
			arg, err := traverse(sql, disjunction)
			if err != nil {
				return "", err
			}
			args = append(args, arg)
		}
		return sql.Or(args...), nil
	case *lep.AndX:
		var args []string
		for _, conjunct := range e.Conjuncts {
			arg, err := traverse(sql, conjunct)
			if err != nil {
				return "", err
			}
			args = append(args, arg)
		}
		return sql.And(args...), nil
	case *lep.EqualsX:
		value := e.Value.Value()
		if value == nil {
			return sql.IsNotNull(e.Param.String()), nil
		}
		return sql.Equal(e.Param.String(), value), nil
	case *lep.NotEqualsX:
		value := e.Value.Value()
		if value == nil {
			return sql.IsNotNull(e.Param.String()), nil
		}
		return sql.NotEqual(e.Param.String(), value), nil
	case *lep.GreaterThanX:
		return sql.GreaterThan(e.Param.String(), e.Value.Value()), nil
	case *lep.InSliceX:
		var items []interface{}
		for _, value := range e.Slice.Values {
			items = append(items, value.Value())
		}
		return sql.In(e.Param.String(), items...), nil

		// TODO: other cases
	}
}
