package folders

import (
	// "fmt"
	"database/sql"
	"strings"

	"github.com/savecost/datav/backend/internal/acl"
	"github.com/savecost/datav/backend/internal/dashboard"
	"github.com/savecost/datav/backend/pkg/utils"

	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/savecost/datav/backend/internal/session"
	"github.com/savecost/datav/backend/pkg/common"
	"github.com/savecost/datav/backend/pkg/db"
	"github.com/savecost/datav/backend/pkg/i18n"
	"github.com/savecost/datav/backend/pkg/models"
)

func CheckExistByName(c *gin.Context) {
	name := c.Query("name")

	if strings.TrimSpace(name) == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if strings.ToLower(name) == strings.ToLower(models.RootFolderName) {
		c.JSON(200, common.ResponseSuccess(0))
		return
	}

	id := -1
	err := db.SQL.QueryRow("SELECT id from folder WHERE title=?", name).Scan(&id)
	if err != nil {
		if err != sql.ErrNoRows {
			c.JSON(500, common.ResponseInternalError())
			return
		}
	}
	c.JSON(200, common.ResponseSuccess(id))
}

func GetByUid(c *gin.Context) {
	uid := c.Param("uid")

	if strings.TrimSpace(uid) == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	folder := &models.Folder{}
	err := db.SQL.QueryRow("SELECT id,title,created_by,created,updated from folder WHERE uid=?",
		uid).Scan(&folder.Id, &folder.Title, &folder.CreatedBy, &folder.Created, &folder.Updated)
	if err != nil {
		if err != sql.ErrNoRows {
			c.JSON(500, common.ResponseInternalError())
			return
		}
	}

	folder.Uid = uid
	folder.UpdatSlug()
	folder.UpdateUrl()

	c.JSON(200, common.ResponseSuccess(folder))
}

func NewFolder(c *gin.Context) {
	folder := &models.Folder{}
	c.Bind(&folder)
	folder.InitNew()

	if strings.TrimSpace(folder.Title) == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if strings.ToLower(folder.Title) == strings.ToLower(models.RootFolderName) {
		c.JSON(400, common.ResponseI18nError("error.folderNameGeneral"))
		return
	}

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	userId := session.CurrentUserId(c)

	res, err := db.SQL.Exec("INSERT INTO folder (parent_id,title,uid,owned_by,created_by,created,updated) VALUES (?,?,?,?,?,?,?)",
		folder.ParentId, folder.Title, folder.Uid, models.GlobalTeamId, userId, folder.Created, folder.Updated)
	if err != nil {
		if db.IsErrUniqueConstraint(err) {
			c.JSON(409, common.ResponseI18nError(i18n.TargetAlreadyExist))
		} else {
			logger.Error("add folder error", "error", err)
			c.JSON(500, common.ResponseInternalError())
		}
		return
	}

	id, _ := res.LastInsertId()
	c.JSON(200, common.ResponseSuccess(utils.Map{
		"id":  id,
		"url": folder.Url,
	}))
}

func UpdateFolder(c *gin.Context) {
	folder := &models.Folder{}
	c.Bind(&folder)

	if strings.TrimSpace(folder.Title) == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if strings.ToLower(folder.Title) == strings.ToLower(models.RootFolderName) {
		c.JSON(400, common.ResponseI18nError("error.folderNameGeneral"))
		return
	}

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	_, err := db.SQL.Exec("UPDATE folder SET title=?,updated=? WHERE id=?", folder.Title, time.Now(), folder.Id)
	if err != nil {
		c.JSON(500, common.ResponseInternalError())
		return
	}
}

func DeleteFolder(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	_, err := db.SQL.Exec("DELETE FROM folder WHERE id=?", id)
	if err != nil {
		logger.Error("delete folder error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	// get dashboards in folder
	rows, err := db.SQL.Query("SELECT id FROM dashboard WHERE folder_id=?", id)
	if err != nil && err != sql.ErrNoRows {
		logger.Error("select dashboard id error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	dashIds := make([]int64, 0)
	for rows.Next() {
		var dashId int64
		err := rows.Scan(&dashId)
		if err != nil {
			logger.Error("select dashboard id scan error", "error", err)
			continue
		}

		dashIds = append(dashIds, dashId)
	}

	for _, dashId := range dashIds {
		err := dashboard.DeleteDashboard(dashId)
		if err != nil {
			logger.Error("delete dashboard error", "error", err, "id", dashId)
			continue
		}
	}
}

func GetAll(c *gin.Context) {
	folders := QueryAll()
	c.JSON(200, common.ResponseSuccess(folders))
}
