package db

import (
	"strings"
	"database/sql"
)

var SQL *sql.DB


func IsErrUniqueConstraint(err error) bool {
	if strings.Contains(err.Error(), "UNIQUE") {
		return true
	}

	return false
}