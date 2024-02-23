// Copyright 2023 xobserve.io Team
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
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xobserve/xo/query/pkg/colorlog"
	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
	"github.com/xobserve/xo/query/pkg/utils"
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

func updateUserData(id int64, data *models.UserData, ctx context.Context) *e.Error {
	d, err := json.Marshal(data)
	if err != nil {
		logger.Warn("update user error", "error", err)
		return e.New(http.StatusBadRequest, e.BadRequest)
	}
	_, err = db.Conn.ExecContext(ctx, "UPDATE user SET data=? WHERE id=?",
		d, id)
	if err != nil {
		logger.Warn("update user data error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetUserDetail(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Query("id"), 10, 64)
	if id == 0 {
		c.JSON(http.StatusBadRequest, common.RespError("bad user id"))
		return
	}

	tenantId, _ := strconv.ParseInt(c.Query("tenantId"), 10, 64)

	u := c.MustGet("currentUser").(*models.User)
	if !u.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NeedWebsiteAdmin))
		return
	}

	var tenants []*models.Tenant
	if tenantId == 0 {
		// query tenants user in
		var err error
		tenants, err = models.QueryTenantsUserIn(c.Request.Context(), id)
		if err != nil {
			logger.Warn("query tenants user in error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespInternalError())
			return
		}
	} else {
		tenants = []*models.Tenant{
			{
				Id: tenantId,
			},
		}
	}
	for _, tenant := range tenants {
		teams, err := models.QueryTeamsUserInTenant(c.Request.Context(), tenant.Id, id)
		if err != nil {
			logger.Warn("query teams user in tenant error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespInternalError())
			return
		}

		tenant.Teams = teams
	}

	c.JSON(http.StatusOK, common.RespSuccess(tenants))
}
