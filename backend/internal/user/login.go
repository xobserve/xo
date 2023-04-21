package user

import (
	"github.com/MyStarship/starship/backend/pkg/e"
	"github.com/MyStarship/starship/backend/pkg/models"
	"github.com/MyStarship/starship/backend/pkg/utils"

	// "fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/db"
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

	encodedPassword, _ := utils.EncodePassword(password, user.Salt)
	if encodedPassword != user.Password {
		c.JSON(http.StatusForbidden, common.RespError(e.PasswordIncorrect))
		return
	}

	deleteSessionByUserId(user.Id)

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
