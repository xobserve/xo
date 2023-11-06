// Copyright 2023 xObserve.io Team
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

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
	"github.com/xObserve/xObserve/query/pkg/utils"
)

func GetSession(c *gin.Context) {
	session := loadSession(c.Request.Context(), getToken(c))
	c.JSON(http.StatusOK, common.RespSuccess(session))
}

type UpdatePasswordModel struct {
	Old     string `json:"oldpw"`
	New     string `json:"newpw"`
	Confirm string `json:"confirmpw"`
}

func UpdateUserPassword(c *gin.Context) {
	var upm = &UpdatePasswordModel{}
	c.Bind(&upm)

	if upm.New != upm.Confirm {
		c.JSON(http.StatusBadRequest, common.RespError("password not match"))
		return
	}

	u := CurrentUser(c)

	// check old password matched
	// super admin can set password without old password
	if u.Username == models.SuperAdminUsername && upm.Old == "" && u.Password == "" {

	} else {
		password, _ := utils.EncodePassword(upm.Old, u.Salt)
		if password != u.Password {
			c.JSON(400, common.RespError(e.PasswordIncorrect))
			return
		}
	}

	err := UpdatePassword(c.Request.Context(), u, upm.New)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func UpdateUserInfo(c *gin.Context) {
	targetUser := &models.User{}
	c.Bind(&targetUser)

	u := CurrentUser(c)
	if u.Role.IsAdmin() || u.Id == targetUser.Id {
		err := updateUserInfo(c.Request.Context(), targetUser)
		if err != nil {
			c.JSON(err.Status, common.RespError(err.Message))
			return
		}

		c.JSON(http.StatusOK, common.RespSuccess(nil))
		return
	}

	c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
}
