package session

import (
	"github.com/tracedt/koala/dashboard/internal/pkg/cql"
	"github.com/tracedt/koala/dashboard/internal/pkg/misc"
	"github.com/tracedt/koala/dashboard/internal/pkg/priv"
	"github.com/labstack/echo"
	"go.uber.org/zap"
)

// Session stores the user login status
type Session struct {
	SID       string `json:"sid"`
	UserID    string `json:"user_id"`
	UserName  string `json:"user_name"`
	Privilege string `json:"priv"`

	password string
}

func (s *Session) setSID(c echo.Context) {
	s.SID = c.Request().Header.Get(misc.SessionID)
}
func (s *Session) validate() (bool, error) {
	var pw string
	q := cql.Static.Query(`SELECT password FROM account WHERE id=?`, s.UserID)
	err := q.Scan(&pw)
	if err != nil {
		misc.Logger.Warn("database error", zap.Error(err), zap.String("cql", q.String()))
		return false, err
	}

	if pw == "" || pw != s.password {
		return false, nil
	}

	return true, nil
}

// Load load data into session
func (s *Session) Load(c echo.Context) {
	s.setSID(c)
	q := cql.Static.Query(`SELECT uid,name,priv FROM session WHERE sid=?`, s.SID)
	err := q.Scan(&s.UserID, &s.UserName, &s.Privilege)
	if err != nil {
		misc.Logger.Warn("database error", zap.Error(err), zap.String("cql", q.String()))
	}
}

func (s *Session) remove() error {
	q := `DELETE FROM session  WHERE sid=?`
	return cql.Static.Query(q, s.SID).Exec()
}

func (s *Session) store() error {
	q := `UPDATE session SET  uid=?,name=?,,priv=? WHERE sid=?`
	return cql.Static.Query(q, s.SID, s.UserName, s.Privilege).Exec()
}

func (s *Session) setPriv() {
	var p string
	cql.Static.Query(`SELECT priv FROM admin WHERE id=?`, s.UserID).Scan(&p)
	if p == "" {
		s.Privilege = priv.Normal
		return
	}
	s.Privilege = p
}
