package accesstoken

import (
	"database/sql"
	"sort"
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

	tokenStr, err := models.GenerateAccessToken(config.Data.AccessToken.Length, token.Scope, token.Mode)
	if err != nil {
		logger.Warn("generate token error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	var tokenId int64
	err = db.Conn.QueryRow("SELECT id FROM access_token WHERE token = ?", tokenStr).Scan(&token.Id)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query token error", "error", err)
		c.JSON(500, common.RespInternalError())
		return

	}
	if tokenId != 0 {
		c.JSON(400, common.RespError("a same token string already exists, please submit again"))
		return
	}

	_, err = db.Conn.Exec("INSERT INTO access_token (token, name, scope, scope_id, description, mode, created, created_by, expired) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)",
		tokenStr, token.Name, token.Scope, token.ScopeId, token.Description, token.Mode, time.Now(), u.Id, token.Expired)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("token name  already exists in the same scope"))
			return
		}
		logger.Warn("create token error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

}

func UpdateToken(c *gin.Context) {
	token := &models.AccessToken{}
	err := c.Bind(&token)
	if err != nil {
		logger.Warn("parse token error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	validToken, err := models.GetAccessToken(token.Id, "")
	if err != nil {
		logger.Warn("get token error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	err = acl.CanEditScope(c.Request.Context(), validToken.Scope, validToken.ScopeId, u)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.Exec("UPDATE access_token SET name=?, description=?, mode=?, expired=? WHERE id=?", token.Name, token.Description, token.Mode, token.Expired, token.Id)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("token name  already exists in the same scope"))
			return
		}
		logger.Warn("update token error", "error", err)
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

func GetTokens(c *gin.Context) {
	scope, err := strconv.Atoi(c.Param("scope"))
	if err != nil {
		logger.Warn("parse scope error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	scopeId := c.Param("scopeId")

	u := c.MustGet("currentUser").(*models.User)
	err = acl.CanEditScope(c.Request.Context(), scope, scopeId, u)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	tokens := make(models.AccessTokens, 0)
	rows, err := db.Conn.Query("SELECT id, name, scope, scope_id, description, mode, created, created_by, expired FROM access_token WHERE scope = ? and scope_id = ?", scope, scopeId)
	if err != nil {
		logger.Warn("query token error", "error", err)
		c.JSON(400, common.RespInternalError())
		return
	}

	for rows.Next() {
		token := &models.AccessToken{}
		err = rows.Scan(&token.Id, &token.Name, &token.Scope, &token.ScopeId, &token.Description, &token.Mode, &token.Created, &token.CreatedBy, &token.Expired)
		if err != nil {
			logger.Warn("scan token error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		tokens = append(tokens, token)
	}

	sort.Sort(tokens)
	c.JSON(200, common.RespSuccess(tokens))
}

func ViewToken(c *gin.Context) {
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

	c.JSON(200, common.RespSuccess(token.Token))
}
