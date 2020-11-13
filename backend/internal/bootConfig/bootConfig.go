package bootConfig

import (
	"database/sql"

	"github.com/apm-ai/datav/backend/pkg/config"

	"github.com/apm-ai/datav/backend/internal/datasources"
	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/internal/sidemenu"
	"github.com/apm-ai/datav/backend/pkg/models"

	// "fmt"
	"github.com/apm-ai/datav/backend/internal/plugins"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/gin-gonic/gin"

	"strconv"
)

type CommonSettings struct {
	AppName         string `json:"appName"`
	Version         string `json:"version"`
	EnableCommunity bool   `json:"enableCommunity"`
}

type bootConfig struct {
	Common          *CommonSettings                      `json:"common"`
	DataSourceMetas map[string]*plugins.DataSourcePlugin `json:"datasourceMetas"`
	DataSources     map[string]interface{}               `json:"datasources"`
	Panels          map[string]interface{}               `json:"panels"`
	SideMenu        interface{}                          `json:"sidemenu"`
}

var logger = log.RootLogger.New("logger", "bootConfig")

func QueryBootConfig(c *gin.Context) {
	user := session.CurrentUser(c)

	// load datasources from sqlstore
	rawDatasources := datasources.LoadAllDataSources()

	datasources := make(map[string]interface{})
	for _, ds := range rawDatasources {
		plugin, ok := plugins.DataSources[ds.Type]
		if !ok {
			logger.Warn("cant find datasrouce plugin", "plugin", ds.Type)
			continue
		}

		ds.JsonData.Set("directUrl", ds.Url)
		newDs := map[string]interface{}{
			"id":        ds.Id,
			"uid":       ds.Uid,
			"type":      ds.Type,
			"name":      ds.Name,
			"url":       "/api/proxy/" + strconv.FormatInt(ds.Id, 10),
			"meta":      plugin,
			"jsonData":  ds.JsonData,
			"isDefault": ds.IsDefault,
		}
		datasources[ds.Name] = newDs
	}

	// load panels
	panels := make(map[string]interface{})
	for _, panel := range plugins.Panels {
		panels[panel.Id] = map[string]interface{}{
			"module":        panel.Module,
			"baseUrl":       panel.BaseUrl,
			"name":          panel.Name,
			"id":            panel.Id,
			"info":          panel.Info,
			"hideFromList":  panel.HideFromList,
			"sort":          getPanelSort(panel.Id),
			"skipDataQuery": panel.SkipDataQuery,
			"state":         panel.State,
		}
	}

	// load side menu
	smId := int64(models.DefaultMenuId)
	if user != nil {
		smId = user.SideMenu
	}
	menu, err := sidemenu.QuerySideMenu(smId, 0)
	if err != nil && err != sql.ErrNoRows {
		logger.Error("query side menu error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if err == sql.ErrNoRows {
		menu, err = sidemenu.QuerySideMenu(models.DefaultMenuId, 0)
	}

	c.JSON(200, common.ResponseSuccess(bootConfig{
		Common: &CommonSettings{
			AppName:         config.Data.Common.AppName,
			Version:         config.Data.Common.Version,
			EnableCommunity: config.Data.Common.EnableCommunity,
		},
		DataSourceMetas: plugins.DataSources,
		DataSources:     datasources,
		Panels:          panels,
		SideMenu:        menu.Data,
	}))
}

func getPanelSort(id string) int {
	sort := 100
	switch id {
	case "graph":
		sort = 1
	case "stat":
		sort = 2
	case "gauge":
		sort = 3
	case "bargauge":
		sort = 4
	case "table":
		sort = 5
	case "singlestat":
		sort = 6
	case "text":
		sort = 7
	case "heatmap":
		sort = 8
	case "alertlist":
		sort = 9
	case "dashlist":
		sort = 10
	case "news":
		sort = 10
	}
	return sort
}
