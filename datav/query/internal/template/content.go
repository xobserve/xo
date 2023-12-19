package template

import (
	"database/sql"
	"encoding/json"

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
	id := c.Param("id")

	content := &models.TemplateContent{}

	var rawdata []byte
	err := db.Conn.QueryRow("select id,template_id,description,version,content,created from template_content where id = ?", id).Scan(
		&content.Id, &content.TemplateId, &content.Description, &content.Version, &rawdata, &content.Created)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("the template content which you are visiting is not exist"))
			return
		}
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	if rawdata != nil {
		err = json.Unmarshal(rawdata, &content.Content)
		if err != nil {
			c.JSON(500, common.RespError(err.Error()))
			return
		}
	}

	c.JSON(200, common.RespSuccess(content))
}
