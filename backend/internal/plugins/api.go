package plugins

import (
	// "fmt"
	"sort"
	"github.com/gin-gonic/gin"
	"github.com/datadefeat/datav/backend/pkg/common"
	"net/http"
)

func GetPlugins(c *gin.Context) {
	tp := c.Query("type")
	result := make(PluginList, 0)

	for _, pluginDef := range Plugins {
		if tp != "" && tp != pluginDef.Type {
			continue
		}
		listItem :=  PluginListItem{
			Id:            pluginDef.Id,
			Name:          pluginDef.Name,
			Type:          pluginDef.Type,
			Category:      pluginDef.Category,
			Info:          &pluginDef.Info,
			LatestVersion: pluginDef.GrafanaNetVersion,
			HasUpdate:     pluginDef.GrafanaNetHasUpdate,
			State:         pluginDef.State,
			Signature:     pluginDef.Signature,
			Enabled: true,
		}

		result = append(result, listItem)
	}

	sort.Sort(result)
	c.JSON(http.StatusOK,common.ResponseSuccess(result))
}

func GetPluginSetting(c *gin.Context) {
	pluginID := c.Query("id")
	def, exists := Plugins[pluginID]
	if !exists {
		logger.Warn("Plugin not found, no installed plugin with that id","pluginID",pluginID)
		c.JSON(http.StatusNotFound, common.ResponseI18nError("pluginNotFound"))
		return 
	}

	dto := &PluginSetting{
		Type:          def.Type,
		Id:            def.Id,
		Name:          def.Name,
		Info:          &def.Info,
		Dependencies:  &def.Dependencies,
		Includes:      def.Includes,
		BaseUrl:       def.BaseUrl,
		Module:        def.Module,
		LatestVersion: def.GrafanaNetVersion,
		HasUpdate:     def.GrafanaNetHasUpdate,
		State:         def.State,
		Signature:     def.Signature,
	}

	// query := models.GetPluginSettingByIdQuery{PluginId: pluginID, OrgId: c.OrgId}
	// if err := bus.Dispatch(&query); err != nil {
	// 	if err != models.ErrPluginSettingNotFound {
	// 		return Error(500, "Failed to get login settings", nil)
	// 	}
	// } else {
	// 	dto.Enabled = query.Result.Enabled
	// 	dto.Pinned = query.Result.Pinned
	// 	dto.JsonData = query.Result.JsonData
	// }

	 c.JSON(http.StatusOK, common.ResponseSuccess(dto))
}

func GetPluginMarkdown(c *gin.Context) {
	pluginID := c.Query("id")

	content, err := getPluginMarkdown(pluginID, "readme")
	if err != nil {
		logger.Warn("Could not get markdown file","error",err)
		c.JSON(501, common.ResponseI18nError("pluginMdError"))
		return
	}

	c.Header("Content-Type", "text/plain; charset=utf-8")
	c.JSON(200, common.ResponseSuccess(string(content)))
	return
}