package cql

import "github.com/gocql/gocql"

// Static is the cql session for access static datas, such as configurable,account
var Static *gocql.Session

// Dynamic is the cql session for access dynamic datas, such as distrubuted tracing, metrics etc
var Dynamic *gocql.Session
