package session

import (
	"strconv"
	"time"

	"github.com/tracedt/koala/dashboard/internal/pkg/code"
	"github.com/tracedt/koala/dashboard/internal/pkg/http"
	"github.com/tracedt/koala/dashboard/internal/pkg/misc"
	"github.com/labstack/echo"
	"go.uber.org/zap"
)

// IsLogin checks whether user is login
func IsLogin(f echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		s := &Session{}
		s.Load(c)
		if s.UserID == "" {
			return c.JSON(http.StatusUnauthorized, http.Resp{
				ErrCode: code.NotLogin,
				Message: code.NotLoginMsg,
			})
		}

		return f(c)
	}
}

// Login is the api for account login
func Login(c echo.Context) error {
	s := &Session{
		UserID:   c.FormValue("user_id"),
		password: c.FormValue("user_pw"),
	}
	s.setSID(c)

	valid, err := s.validate()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, http.Resp{
			ErrCode: code.DatabaseError,
			Message: code.DatabaseErrorMsg,
		})
	}

	if !valid {
		return c.JSON(http.StatusUnauthorized, http.Resp{
			ErrCode: code.AccNotExistOrPwInvalid,
			Message: code.AccNotExistOrPwInvalidMsg,
		})
	}

	// set users privilege
	s.setPriv()

	// remove the old session
	err = s.remove()
	if err != nil {
		misc.Logger.Warn("database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, http.Resp{
			ErrCode: code.DatabaseError,
			Message: code.DatabaseErrorMsg,
		})
	}

	// generate new sid
	s.SID = strconv.FormatInt(time.Now().UnixNano(), 10)

	// store the new session
	s.store()
	if err != nil {
		misc.Logger.Warn("database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, http.Resp{
			ErrCode: code.DatabaseError,
			Message: code.DatabaseErrorMsg,
		})
	}

	return c.JSON(http.StatusOK, http.Resp{
		Data: s,
	})
}

// Logout is the api for account Logout
func Logout(c echo.Context) error {
	s := &Session{}
	s.setSID(c)

	err := s.remove()
	if err != nil {
		misc.Logger.Warn("database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, http.Resp{
			ErrCode: code.DatabaseError,
			Message: code.DatabaseErrorMsg,
		})
	}

	return c.JSON(http.StatusOK, http.Resp{})
}
