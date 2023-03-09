package variables

import (
	"time"

	"github.com/ai-apm/aiapm/backend/pkg/common"
	"github.com/ai-apm/aiapm/backend/pkg/db"
	"github.com/ai-apm/aiapm/backend/pkg/e"
	"github.com/ai-apm/aiapm/backend/pkg/log"
	"github.com/ai-apm/aiapm/backend/pkg/models"
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

	if v.Type != "1" && v.Type != "2" && v.Type != "3" {
		logger.Warn("variable type invalid", "type", v.Type)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	now := time.Now()
	_, err = db.Conn.Exec("INSERT INTO variable(name,type,value,external_url,created,updated) VALUES(?,?,?,?,?,?)",
		v.Name, v.Type, v.Value, v.ExternalUrl, now, now)
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

func GetVariables(c *gin.Context) {
	vars := []*models.Variable{}
	rows, err := db.Conn.Query("SELECT id,name,type,value,external_url FROM variable")
	if err != nil {
		logger.Warn("query variables error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	for rows.Next() {
		v := &models.Variable{}
		err = rows.Scan(&v.Id, &v.Name, &v.Type, &v.Value, &v.ExternalUrl)
		if err != nil {
			logger.Warn("scan variable error", "error", err)
			continue
		}

		vars = append(vars, v)
	}

	c.JSON(200, common.RespSuccess(vars))
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

	if v.Type != "1" && v.Type != "2" && v.Type != "3" {
		logger.Warn("variable type invalid", "type", v.Type)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	now := time.Now()
	_, err = db.Conn.Exec("UPDATE variable SET name=?,type=?,value=?,external_url=?,updated=? WHERE id=?",
		v.Name, v.Type, v.Value, v.ExternalUrl, now, v.Id)
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
