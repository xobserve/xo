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
	"net/http"
	"time"

	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/log"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/DataObserve/datav/backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

var logger = log.RootLogger.New("logger", "user")

func Init() error {
	return nil
}

func IsLogin(c *gin.Context) bool {
	token := getToken(c)
	sess := loadSession(token)

	return sess != nil
}

func UpdatePassword(user *models.User, new string) *e.Error {
	newPassword, _ := utils.EncodePassword(new, user.Salt)
	_, err := db.Conn.Exec("UPDATE user SET password=?,updated=? WHERE id=?",
		newPassword, time.Now(), user.Id)
	if err != nil {
		logger.Warn("update user password error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func updateUserInfo(user *models.User) *e.Error {
	now := time.Now()

	_, err := db.Conn.Exec("UPDATE user SET name=?,email=?,updated=? WHERE id=?",
		user.Name, user.Email, now, user.Id)
	if err != nil {
		logger.Warn("update user error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}
