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
	"net/http"
	"time"

	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/db"
	"github.com/DataObserve/datav/query/pkg/e"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/DataObserve/datav/query/pkg/utils"
	"github.com/gin-gonic/gin"
)

var logger = colorlog.RootLogger.New("logger", "user")

func Init() error {
	return nil
}

func IsLogin(c *gin.Context) bool {
	token := getToken(c)
	sess := loadSession(c.Request.Context(), token)

	return sess != nil
}

func UpdatePassword(ctx context.Context, user *models.User, new string) *e.Error {
	newPassword, _ := utils.EncodePassword(new, user.Salt)
	_, err := db.Conn.ExecContext(ctx, "UPDATE user SET password=?,updated=? WHERE id=?",
		newPassword, time.Now(), user.Id)
	if err != nil {
		logger.Warn("update user password error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func updateUserInfo(ctx context.Context, user *models.User) *e.Error {
	now := time.Now()

	_, err := db.Conn.ExecContext(ctx, "UPDATE user SET name=?,email=?,updated=? WHERE id=?",
		user.Name, user.Email, now, user.Id)
	if err != nil {
		logger.Warn("update user error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}
