package user

import (
	"net/http"
	"time"

	"github.com/ai-apm/aiapm/backend/pkg/db"
	"github.com/ai-apm/aiapm/backend/pkg/e"
	"github.com/ai-apm/aiapm/backend/pkg/log"
	"github.com/ai-apm/aiapm/backend/pkg/models"
	"github.com/ai-apm/aiapm/backend/pkg/utils"
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
