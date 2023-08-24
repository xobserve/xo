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
	"github.com/DataObserve/datav/backend/pkg/config"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/DataObserve/datav/backend/pkg/utils"

	// "fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/gin-gonic/gin"
)

// LoginModel ...
type LoginModel struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Login ...
func Login(c *gin.Context) {
	var lm = &LoginModel{}
	c.Bind(&lm)

	username := lm.Username
	password := lm.Password

	logger.Info("User loged in", "username", username)

	user, err := models.QueryUserByName(username)
	if err != nil {
		logger.Warn("query user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if user.Id == 0 {
		c.JSON(400, common.RespError(e.UserNotExist))
		return
	}

	// admin can reset password to empty
	if username == models.SuperAdminUsername && password == "" && password == user.Password {

	} else {
		encodedPassword, _ := utils.EncodePassword(password, user.Salt)

		if encodedPassword != user.Password {
			c.JSON(http.StatusForbidden, common.RespError(e.PasswordIncorrect))
			return
		}
	}

	if config.Data.User.EnableMultiLogin {
		lastSid := getToken(c)
		deleteSession(lastSid)
	} else {
		deleteSessionByUserId(user.Id)
	}

	token := strconv.FormatInt(time.Now().UnixNano(), 10)

	session := &models.Session{
		Token:      token,
		User:       user,
		CreateTime: time.Now(),
	}
	//sub token验证成功，保存session
	err = storeSession(session)
	if err != nil {
		c.JSON(500, common.RespInternalError())
		return
	}

	// 更新数据库中的user表
	_, err = db.Conn.Exec(`UPDATE user SET last_seen_at=? WHERE id=?`, time.Now(), user.Id)
	if err != nil {
		logger.Warn("set last login date error", "error", err)
	}

	c.JSON(http.StatusOK, common.RespSuccess(session))
}

// Logout ...
func Logout(c *gin.Context) {
	token := getToken(c)
	// 删除用户的session
	deleteSession(token)

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
