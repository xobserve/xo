package user

import (
	"net/http"

	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/e"
	"github.com/MyStarship/starship/backend/pkg/models"
	"github.com/MyStarship/starship/backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func GetSession(c *gin.Context) {
	session := loadSession(getToken(c))
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
	password, _ := utils.EncodePassword(upm.Old, u.Salt)
	if password != u.Password {
		c.JSON(400, common.RespError(e.PasswordIncorrect))
		return
	}

	err := UpdatePassword(u, upm.New)
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
		err := updateUserInfo(targetUser)
		if err != nil {
			c.JSON(err.Status, common.RespError(err.Message))
			return
		}

		c.JSON(http.StatusOK, common.RespSuccess(nil))
		return
	}

	c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
}
