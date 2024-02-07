package accesstoken

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/config"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "token")

func CreateToken(c *gin.Context) {
	token := &models.AccessToken{}
	err := c.Bind(&token)
	if err != nil {
		logger.Warn("parse token error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	err = acl.CanEditScope(c.Request.Context(), token.Scope, token.ScopeId, u)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	tokenStr, err := models.GenerateAccessToken(config.Data.AccessToken.Length)
	if err != nil {
		logger.Warn("generate token error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	fmt.Println("token", string(tokenStr), len(tokenStr))

	_, err = db.Conn.Exec("INSERT INTO access_token (token, name, scope, scope_id, description, created, created_by, expired) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
		tokenStr, token.Name, token.Scope, token.ScopeId, token.Description, time.Now(), u.Id, token.Expired)
	if err != nil {
		logger.Warn("create token error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

}

func DeleteToken(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		logger.Warn("parse token id error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	token, err := models.GetAccessToken(id, "")
	if err != nil {
		logger.Warn("get token error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	u := c.MustGet("currentUser").(*models.User)

	err = acl.CanEditScope(c.Request.Context(), token.Scope, token.ScopeId, u)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.Exec("DELETE FROM access_token WHERE id = ?", id)
	if err != nil {
		logger.Warn("delete token error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}
