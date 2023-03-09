package e

import "strings"

func IsErrUniqueConstraint(err error) bool {
	if strings.Contains(err.Error(), "Duplicate entry") {
		return true
	}

	return false
}
