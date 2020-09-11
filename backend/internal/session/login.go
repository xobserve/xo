package session

import (
	"github.com/code-creatively/datav/backend/pkg/utils"
	"github.com/code-creatively/datav/backend/pkg/models"
	// "fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/code-creatively/datav/backend/pkg/common"
	"github.com/code-creatively/datav/backend/pkg/db"
	"github.com/code-creatively/datav/backend/pkg/i18n"
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

	user,err := models.QueryUser(0,username,"")
	if err != nil {
		logger.Warn("query user error","error",err)
		c.JSON(500, common.ResponseInternalError())
		return 
	}

	if user.Id == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.UserNotExist))
		return 
	} 

	encodedPassword,_ := utils.EncodePassword(password,user.Salt)
	if encodedPassword != user.Password{
		c.JSON(http.StatusForbidden, common.ResponseI18nError(i18n.PasswordIncorrect))
		return
	}

	token := getToken(c)
	deleteSession(token)

	token = strconv.FormatInt(time.Now().UnixNano(), 10)

	session := &Session{
		Token: token,
		User: user,
		CreateTime: time.Now(),
	}
	//sub token验证成功，保存session
	err = storeSession(session)
	if err != nil {
		c.JSON(500, common.ResponseInternalError())
		return
	} 
 
	// 更新数据库中的user表
	_, err = db.SQL.Exec(`UPDATE user SET last_seen_at=? WHERE id=?`, time.Now(), user.Id)
	if err != nil {
		logger.Warn("set last login date error", "error", err)
	}

	c.JSON(http.StatusOK, common.ResponseSuccess(session))
}

// Logout ...
func Logout(c *gin.Context) {
	token := getToken(c)
	// 删除用户的session
	deleteSession(token)

	c.JSON(http.StatusOK, common.ResponseSuccess(nil))
}
