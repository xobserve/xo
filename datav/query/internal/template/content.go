package template

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func GetTemplateContents(c *gin.Context) {
	id := c.Param("id")

	rows, err := db.Conn.Query("select id,description,version,created from template_content where template_id = ? ORDER BY created DESC", id)
	if err != nil {
		c.JSON(500, common.RespError(err.Error()))
		return
	}
	defer rows.Close()

	contents := make([]*models.TemplateContent, 0)
	for rows.Next() {
		content := &models.TemplateContent{}
		err := rows.Scan(&content.Id, &content.Description, &content.Version, &content.Created)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		contents = append(contents, content)
	}

	c.JSON(200, common.RespSuccess(contents))
}

type TemplateContentReq struct {
	TemplateId int64 `json:"templateId"`
	ContentId  int64 `json:"contentId"`
}

func UseTemplateContent(c *gin.Context) {
	req := &TemplateContentReq{}
	err := c.BindJSON(req)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.Exec("update template set content_id = ? where id = ?", req.ContentId, req.TemplateId)
	if err != nil {
		c.JSON(500, common.RespError(err.Error()))
		return
	}
}

func GetTemplateContent(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	content, err := models.QueryTemplateContent(c.Request.Context(), id)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	c.JSON(200, common.RespSuccess(content))
}

type CreateTemplateContentReq struct {
	Ids []string `json:"ids"`
}

func GetTemplateContentsByIds(c *gin.Context) {
	req := &CreateTemplateContentReq{}
	err := c.BindJSON(req)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	sql := fmt.Sprintf("select template.id, template_content.content from template_content JOIN template where template.id in ('%s') and template_content.id=template.content_id", strings.Join(req.Ids, "','"))
	rows, err := db.Conn.Query(sql)
	if err != nil {
		logger.Warn("get template content error", "error", err, "sql", sql)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
	defer rows.Close()

	contents := make([]*models.TemplateContent, 0)
	for rows.Next() {
		content := &models.TemplateContent{}
		var rawdata []byte
		err := rows.Scan(&content.TemplateId, &rawdata)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if rawdata != nil {
			err = json.Unmarshal(rawdata, &content.Content)
			if err != nil {
				c.JSON(400, common.RespError(err.Error()))
				return
			}
		}
		contents = append(contents, content)
	}

	c.JSON(200, common.RespSuccess(contents))
}

func GetTemplateNewestVersion(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(400, common.RespError("invalid template id"))
		return
	}

	version, err := models.QueryTemplateNewestVersion(c.Request.Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(200, common.RespSuccess(""))
			return
		}
		logger.Warn("query template newest version error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	c.JSON(200, common.RespSuccess(version))
}
