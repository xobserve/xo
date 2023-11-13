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
	"encoding/json"
	"fmt"

	"github.com/xObserve/xObserve/query/pkg/config"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
	"github.com/xObserve/xObserve/query/pkg/utils"

	// "fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
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

	user, err := models.QueryUserByName(c.Request.Context(), username)
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

	login(user, c)
}

func login(user *models.User, c *gin.Context) {
	if config.Data.User.EnableMultiLogin {
		lastSid := getToken(c)
		deleteSession(c.Request.Context(), lastSid)
	} else {
		deleteSessionByUserId(c.Request.Context(), user.Id)
	}

	if user.CurrentTenant == 0 {
		tenants, err := models.QueryTenantsByUserId(user.Id)
		if err != nil {
			logger.Warn("Error query user tenants", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		if len(tenants) == 0 {
			c.JSON(400, common.RespError("You are not in any tenant now"))
			return
		}

		user.CurrentTenant = tenants[0].Id
	}

	if user.CurrentTeam == 0 {
		teams, err := models.QueryVisibleTeamsByUserId(c.Request.Context(), user.CurrentTenant, user.Id)
		if err != nil {
			logger.Warn("Error query user teams", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		if len(teams) == 0 {
			c.JSON(400, common.RespError("You are not in any team now"))
			return
		}

		user.CurrentTeam = teams[0]
	}

	token := strconv.FormatInt(time.Now().UnixNano(), 10)

	session := &models.Session{
		Token:      token,
		User:       user,
		CreateTime: time.Now(),
	}
	//sub token验证成功，保存session
	err := storeSession(c.Request.Context(), session)
	if err != nil {
		c.JSON(500, common.RespInternalError())
		return
	}

	// 更新数据库中的user表
	_, err = db.Conn.ExecContext(c.Request.Context(), `UPDATE user SET last_seen_at=?,visit_count=visit_count+1,current_tenant=?,current_team=? WHERE id=?`, time.Now(), user.CurrentTenant, user.CurrentTeam, user.Id)
	if err != nil {
		logger.Warn("set last login date error", "error", err)
	}

	c.JSON(http.StatusOK, common.RespSuccess(session))
}

type CodeReq struct {
	Code string `json:"code"`
}

func LoginGithub(c *gin.Context) {
	req := &CodeReq{}
	c.Bind(&req)

	lastSid := getToken(c)
	deleteSession(c.Request.Context(), lastSid)

	// get github token
	tokenUrl := getGithubTokenAuthUrl(req.Code)

	token, err := getGithubToken(tokenUrl)
	if err != nil {
		logger.Warn("get github token error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}

	githubUser, err := getGithubUserInfo(token)
	if err != nil {
		logger.Warn("get github token error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}

	if githubUser.ID == 0 {
		logger.Warn("github 用户 id 为 0", "github_user", githubUser)
		c.JSON(http.StatusBadRequest, common.RespError("获取 github 信息出错"))
		return
	}

	// query user by username
	user, err := models.QueryUserByName(c.Request.Context(), githubUser.Username)
	if err != nil {
		logger.Warn("query user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if user.Id == 0 {
		// create user
		salt, _ := utils.GetRandomString(10)
		encodedPW, _ := utils.EncodePassword("", salt)
		now := time.Now()

		tx, err := db.Conn.Begin()
		if err != nil {
			logger.Warn("new team error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		defer tx.Rollback()

		res, err := tx.ExecContext(c.Request.Context(), "INSERT INTO user (username,name,password,salt,come_from,current_tenant,created,updated) VALUES (?,?,?,?,?,?,?,?)",
			githubUser.Username, githubUser.Name, encodedPW, salt, "github", models.DefaultTenantId, now, now)
		if err != nil {
			logger.Warn("new user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		id, err := res.LastInsertId()
		if err != nil {
			logger.Warn("new user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		// add user to global team
		_, err = tx.ExecContext(c.Request.Context(), "INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)",
			models.GlobalTeamId, id, models.ROLE_VIEWER, now, now)
		if err != nil {
			logger.Warn("new user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		err = tx.Commit()
		if err != nil {
			logger.Warn("commit sql transaction error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		user.Id = id
		user.Username = githubUser.Username
		user.Name = githubUser.Name
		user.Password = encodedPW
		user.Salt = salt
		user.LastSeenAt = &now
	}

	login(user, c)
}

// Logout ...
func Logout(c *gin.Context) {
	token := getToken(c)
	// 删除用户的session
	deleteSession(c.Request.Context(), token)

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func getGithubTokenAuthUrl(code string) string {
	return fmt.Sprintf(
		"https://github.com/login/oauth/access_token?client_id=%s&client_secret=%s&code=%s",
		config.Data.User.GithubOAuthToken, config.Data.User.GithubOAuthSecret, code,
	)
}

// 获取 token
func getGithubToken(url string) (*Token, error) {

	// 形成请求
	var req *http.Request
	var err error
	if req, err = http.NewRequest(http.MethodGet, url, nil); err != nil {
		return nil, err
	}
	req.Header.Set("accept", "application/json")

	// 发送请求并获得响应
	var httpClient = http.Client{}
	var res *http.Response
	if res, err = httpClient.Do(req); err != nil {
		return nil, err
	}

	// 将响应体解析为 token，并返回
	var token Token
	if err = json.NewDecoder(res.Body).Decode(&token); err != nil {
		return nil, err
	}
	return &token, nil
}

type Token struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"` // 这个字段没用到
	Scope       string `json:"scope"`      // 这个字段也没用到
}

// 获取用户信息
func getGithubUserInfo(token *Token) (*models.GithubUser, error) {

	// 形成请求
	// go-github.Client
	var userInfoUrl = "https://api.github.com/user" // github用户信息获取接口
	var req *http.Request
	var err error
	if req, err = http.NewRequest(http.MethodGet, userInfoUrl, nil); err != nil {
		return nil, err
	}
	req.Header.Set("accept", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("token %s", token.AccessToken))

	// 发送请求并获取响应
	var client = http.Client{}
	var res *http.Response
	if res, err = client.Do(req); err != nil {
		return nil, err
	}

	// 将响应的数据写入 userInfo 中，并返回
	var userInfo = &models.GithubUser{}
	if err = json.NewDecoder(res.Body).Decode(&userInfo); err != nil {
		return nil, err
	}
	return userInfo, nil
}
