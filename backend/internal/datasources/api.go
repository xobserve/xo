package datasources

import (
	"encoding/json"
	"strconv"
	"strings"

	"github.com/codecc-com/datav/backend/pkg/utils/securejson"

	"github.com/codecc-com/datav/backend/internal/acl"
	"github.com/codecc-com/datav/backend/internal/plugins"
	"github.com/codecc-com/datav/backend/internal/session"
	"github.com/codecc-com/datav/backend/pkg/common"
	"github.com/codecc-com/datav/backend/pkg/i18n"
	"github.com/codecc-com/datav/backend/pkg/models"

	// "fmt"

	"time"

	"github.com/codecc-com/datav/backend/pkg/db"
	"github.com/codecc-com/datav/backend/pkg/utils"
	"github.com/codecc-com/datav/backend/pkg/utils/simplejson"
	"github.com/gin-gonic/gin"
)

func NewDataSource(c *gin.Context) {
	userId := session.CurrentUserId(c)
	ds := &models.DataSource{}
	c.BindJSON(&ds)

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	ds.Uid = utils.GenerateShortUID()
	ds.Version = InitDataSourceVersion
	ds.Created = time.Now()
	ds.Updated = time.Now()
	if ds.JsonData == nil {
		ds.JsonData = simplejson.New()
	}
	if ds.SecureJsonData == nil {
		ds.SecureJsonData = make(securejson.SecureJsonData)
	}

	jsonData, err := ds.JsonData.Encode()
	secureJsonData, err := json.Marshal(ds.SecureJsonData)

	for k, v := range ds.SecureJsonData {
		v1 := string(v)
		if strings.TrimSpace(v1) == "" || strings.TrimSpace(k) == "" {
			c.JSON(403, common.ResponseI18nError("error.customHttpHeaderEmpty"))
			return
		}
	}

	res, err := db.SQL.Exec(`INSERT INTO data_source (name, uid, version, type, url, is_default, json_data,secure_json_data,basic_auth,created_by,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		ds.Name, ds.Uid, ds.Version, ds.Type, ds.Url, ds.IsDefault, jsonData, secureJsonData, ds.BasicAuth, userId, ds.Created, ds.Updated)
	if err != nil {
		logger.Warn("add datasource error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	id, _ := res.LastInsertId()
	ds.Id = id

	err = updateIsDefaultFlag(ds)
	if err != nil {
		logger.Warn("update datasource default flag error", "error", err)
	}

	c.JSON(200, common.ResponseSuccess(ds))
}

func GetDataSources(c *gin.Context) {
	datasources := LoadAllDataSources()
	for _, ds := range datasources {
		if plugin, exists := plugins.DataSources[ds.Type]; exists {
			ds.TypeLogoUrl = plugin.Info.Logos.Small
		} else {
			ds.TypeLogoUrl = "public/img/icn-datasource.svg"
		}
	}
	c.JSON(200, common.ResponseSuccess(datasources))
}

func GetDataSource(c *gin.Context) {
	if !acl.IsGlobalEditor(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	id, _ := strconv.ParseInt(c.Param("dataSourceID"), 10, 64)
	if id == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	ds, err := models.QueryDataSource(id, "")
	if err != nil {
		logger.Warn("query datasource error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}
	c.JSON(200, common.ResponseSuccess(ds))
}

func EditDataSource(c *gin.Context) {
	ds := &models.DataSource{}
	c.BindJSON(&ds)

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	ds.Updated = time.Now()
	jsonData, err := ds.JsonData.Encode()
	secureJsonData, err := json.Marshal(ds.SecureJsonData)
	for k, v := range ds.SecureJsonData {
		v1 := string(v)
		if strings.TrimSpace(v1) == "" || strings.TrimSpace(k) == "" {
			c.JSON(403, common.ResponseI18nError("error.customHttpHeaderEmpty"))
			return
		}
	}

	_, err = db.SQL.Exec(`UPDATE data_source SET name=?, version=?, type=?, url=?, is_default=?, json_data=?,secure_json_data=?, basic_auth=?, updated=? WHERE id=?`,
		ds.Name, ds.Version, ds.Type, ds.Url, ds.IsDefault, jsonData, secureJsonData, ds.BasicAuth, ds.Updated, ds.Id)
	if err != nil {
		logger.Warn("edit datasource error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	err = updateIsDefaultFlag(ds)
	if err != nil {
		logger.Warn("update datasource default flag error", "error", err)
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteDataSource(c *gin.Context) {
	dsID := c.Param("dataSourceID")

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	_, err := db.SQL.Exec(`DELETE FROM data_source  WHERE id=?`, dsID)
	if err != nil {
		logger.Warn("delete datasource error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}
