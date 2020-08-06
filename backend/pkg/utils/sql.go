package utils

import (
	"fmt"
)

// 生成 ('a','b','c')的形式
func GenSqlInString(ss []string) string {
	if len(ss) == 1 {
		return fmt.Sprintf("('%s')", ss[0])
	}

	var target string
	for i, s := range ss {
		if i == 0 {
			target = fmt.Sprintf("('%s',", s)
			continue
		}

		if i == len(ss)-1 {
			target = fmt.Sprintf("%s'%s')", target, s)
			continue
		}

		target = fmt.Sprintf("%s'%s',", target, s)
	}

	return target
}

func GenCqlInString(ss []string) string {
	if len(ss) == 1 {
		return fmt.Sprintf("%s", ss[0])
	}

	var target string
	for i, s := range ss {
		if i == 0 {
			target = fmt.Sprintf("%s,", s)
			continue
		}

		if i == len(ss)-1 {
			target = fmt.Sprintf("%s%s", target, s)
			continue
		}

		target = fmt.Sprintf("%s%s,", target, s)
	}

	return target
}
