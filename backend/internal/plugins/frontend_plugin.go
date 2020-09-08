package plugins

import (
	"net/url"
	"path"
	"strings"
	"github.com/codecc-com/datav/backend/pkg/config"
)

type FrontendPluginBase struct {
	PluginBase
}

func (fp *FrontendPluginBase) initFrontendPlugin() {
	if isExternalPlugin(fp.PluginDir) {
		StaticRoutes = append(StaticRoutes, &PluginStaticRoute{
			Directory: fp.PluginDir,
			PluginId:  fp.Id,
		})
	}

	fp.handleModuleDefaults()

	fp.Info.Logos.Small = getPluginLogoUrl(fp.Type, fp.Info.Logos.Small, fp.BaseUrl)
	fp.Info.Logos.Large = getPluginLogoUrl(fp.Type, fp.Info.Logos.Large, fp.BaseUrl)

	for i := 0; i < len(fp.Info.Screenshots); i++ {
		fp.Info.Screenshots[i].Path = evalRelativePluginUrlPath(fp.Info.Screenshots[i].Path, fp.BaseUrl)
	}
}

func getPluginLogoUrl(pluginType, path, baseUrl string) string {
	if path == "" {
		return "icn-" + pluginType + ".svg"
	}

	return evalRelativePluginUrlPath(path, baseUrl)
}


func (fp *FrontendPluginBase) handleModuleDefaults() {

	if isExternalPlugin(fp.PluginDir) {
		//@todo
		fp.Module = path.Join("plugins", fp.Id, "module")
		fp.BaseUrl = path.Join("public/plugins", fp.Id)
		return
	}

	fp.IsCorePlugin = true
	fp.Module = path.Join("src/plugins", fp.Type, fp.Id, "module")
	fp.BaseUrl = path.Join("plugins", fp.Type, fp.Id)
}

func isExternalPlugin(pluginDir string) bool {
	return !strings.Contains(pluginDir, config.Data.Common.StaticRootPath)
}

func evalRelativePluginUrlPath(pathStr string, baseUrl string) string {
	if pathStr == "" {
		return ""
	}

	u, _ := url.Parse(pathStr)
	if u.IsAbs() {
		return pathStr
	}
	return path.Join(baseUrl, pathStr)
}
