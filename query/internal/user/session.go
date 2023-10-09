// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package user

import (
	"context"
	"database/sql"
	"strconv"

	"github.com/DataObserve/datav/query/pkg/config"

	"github.com/DataObserve/datav/query/pkg/models"

	// "fmt"
	"time"

	"github.com/DataObserve/datav/query/pkg/db"
	"github.com/gin-gonic/gin"
)

func storeSession(ctx context.Context, s *models.Session) error {
	_, err := db.Conn.ExecContext(ctx, `INSERT INTO  sessions (user_id,sid) VALUES (?,?)`, s.User.Id, s.Token)
	if err != nil {
		logger.Warn("store session error", "error", err)
		return err
	}
	return nil
}

func loadSession(ctx context.Context, sid string) *models.Session {
	var userid int64
	err := db.Conn.QueryRowContext(ctx, `SELECT user_id FROM sessions WHERE sid=?`, sid).Scan(&userid)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query session error", "error", err)
		}
		return nil
	}

	user, err := models.QueryUserById(ctx, userid)
	if err != nil {
		logger.Warn("query user error", "error", err)
		return nil
	}

	if user.Id == 0 {
		return nil
	}

	return &models.Session{
		Token: sid,
		User:  user,
	}
}

func deleteSession(ctx context.Context, sid string) {
	_, err := db.Conn.ExecContext(ctx, `DELETE FROM sessions  WHERE sid=?`, sid)
	if err != nil {
		logger.Warn("delete session error", "error", err)
	}
}

func deleteSessionByUserId(ctx context.Context, uid int64) {
	_, err := db.Conn.ExecContext(ctx, `DELETE FROM sessions  WHERE user_id=?`, uid)
	if err != nil {
		logger.Warn("delete session error", "error", err)
	}
}

func getToken(c *gin.Context) string {
	return c.Request.Header.Get("X-Token")
}

func CurrentUser(c *gin.Context) *models.User {
	token := getToken(c)
	createTime, _ := strconv.ParseInt(token, 10, 64)
	if createTime != 0 {
		// check whether token is expired
		if (time.Now().Unix() - createTime/1e9) > config.Data.User.SessionExpire {
			deleteSession(c.Request.Context(), token)
			return nil
		}
	}

	sess := loadSession(c.Request.Context(), token)
	if sess == nil {
		// 用户未登陆或者session失效
		return nil
	}

	return sess.User
}

func CurrentUserId(c *gin.Context) int64 {
	user := CurrentUser(c)
	return user.Id
}
