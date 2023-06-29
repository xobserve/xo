package variables

import (
	"time"

	"github.com/MyStarship/starship/backend/internal/user"
	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/db"
	"github.com/MyStarship/starship/backend/pkg/e"
	"github.com/MyStarship/starship/backend/pkg/log"
	"github.com/MyStarship/starship/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

var logger = log.RootLogger.New("logger", "variables")

// name VARCHAR(60) PRIMARY KEY NOT NULL,
// type VARCHAR(10) NOT NULL,
// value TEXT,
// external_url VARCHAR(255) DEFAULT '',
// created DATETIME NOT NULL,
// updated DATETIME NOT NULL
func AddNewVariable(c *gin.Context) {
	v := &models.Variable{}
	err := c.Bind(&v)
	if err != nil {
		logger.Warn("bind variable error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	if !isVariableNameValid(v.Name) {
		logger.Warn("variable name invalid", "name", v.Name)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := user.CurrentUser(c)
	// only admin can do this
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()
	_, err = db.Conn.Exec("INSERT INTO variable(name,type,value,datasource,description,refresh,enableMulti,enableAll,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?)",
		v.Name, v.Type, v.Value, v.Datasource, v.Desc, v.Refresh, v.EnableMulti, v.EnableAll, now, now)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("variable name already exists"))
			return
		}
		logger.Warn("insert variable error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	c.JSON(200, common.RespSuccess(nil))
}

func GetVariables() ([]*models.Variable, error) {
	vars := []*models.Variable{}
	rows, err := db.Conn.Query("SELECT id,name,type,value,datasource,description,refresh,enableMulti,enableAll FROM variable")
	if err != nil {

		return nil, err
	}

	for rows.Next() {
		v := &models.Variable{}
		err = rows.Scan(&v.Id, &v.Name, &v.Type, &v.Value, &v.Datasource, &v.Desc, &v.Refresh, &v.EnableMulti, &v.EnableAll)
		if err != nil {
			logger.Warn("scan variable error", "error", err)
			continue
		}

		vars = append(vars, v)
	}

	return vars, nil
}

func UpdateVariable(c *gin.Context) {
	v := &models.Variable{}
	err := c.Bind(&v)
	if err != nil {
		logger.Warn("bind variable error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	if !isVariableNameValid(v.Name) {
		logger.Warn("variable name invalid", "name", v.Name)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := user.CurrentUser(c)
	// only admin can do this
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()
	_, err = db.Conn.Exec("UPDATE variable SET name=?,type=?,value=?,datasource=?,description=?,refresh=?,enableMulti=?,enableAll=?,updated=? WHERE id=?",
		v.Name, v.Type, v.Value, v.Datasource, v.Desc, v.Refresh, v.EnableMulti, v.EnableAll, now, v.Id)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("variable name already exists"))
			return
		}
		logger.Warn("insert variable error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	c.JSON(200, common.RespSuccess(nil))
}

func DeleteVariable(c *gin.Context) {
	id := c.Param("id")

	u := user.CurrentUser(c)
	// only admin can do this
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	_, err := db.Conn.Exec("DELETE FROM variable WHERE id=?", id)
	if err != nil {
		logger.Warn("delete variable error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

// only allow a-z A-Z 0-9
func isVariableNameValid(name string) bool {
	for _, v := range name {
		if v >= 'a' && v <= 'z' {
			continue
		}
		if v >= 'A' && v <= 'Z' {
			continue
		}
		if v >= '0' && v <= '9' {
			continue
		}

		return false
	}

	return true
}
