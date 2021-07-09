package plugins

import (
	"fmt"
	"os"
	"os/exec"
	"path"

	"github.com/datav-io/datav/backend/pkg/config"
	"github.com/datav-io/datav/backend/pkg/utils"
	"github.com/datav-io/datav/backend/pkg/utils/errutil"
)

var internalImports = make([]string, 0)
var internalExport = make([]string, 0)
var externalImports = make([]string, 0)
var externalExport = make([]string, 0)

func (p *PluginManager) Generate() error {
	DataSources = map[string]*DataSourcePlugin{}
	Panels = map[string]*PanelPlugin{}
	Plugins = map[string]*PluginBase{}
	PluginTypes = map[string]interface{}{
		"panel":      PanelPlugin{},
		"datasource": DataSourcePlugin{},
	}
	StaticRoutes = []*PluginStaticRoute{}

	logger.Info("Starting plugin search")

	// load internal built-in plugins
	plugDir := path.Join(config.Data.Server.StaticRootPath, "/src/plugins")
	if err := p.scan(plugDir, false); err != nil {
		return errutil.Wrapf(err, "failed to scan core plugin directory '%s'", plugDir)
	}

	// delete old public plugins dir
	cmd := exec.Command("bash", "-c", "rm -rf ui/public/plugins")
	if _, err := cmd.CombinedOutput(); err != nil {
		logger.Error("delete old public plugins dir error", "error", err)
	}

	for _, panel := range Panels {
		panel.generate()
	}

	for _, ds := range DataSources {
		ds.generate()
	}

	generatePluginFile()

	return nil
}

func (fp *FrontendPluginBase) generate() {
	fp.IsExternal = isExternalPlugin(fp.PluginDir)
	fp.handleModuleDefaults()

	// copy plugin img to public directory
	publicPath := "ui/public/plugins"
	dirPath := fmt.Sprintf("%s/%s/%s/", publicPath, fp.Type, fp.Id)
	exist, _ := utils.FileExists(dirPath)
	if !exist {
		err := os.MkdirAll(dirPath, os.ModePerm)
		if err != nil {
			logger.Error("create plugin public dir error", "dst_path", dirPath, "error", err)
		}
	}

	cmd := exec.Command("bash", "-c", fmt.Sprintf("cp -r %s %s", fp.PluginDir+"/img/*", dirPath))
	if _, err := cmd.CombinedOutput(); err != nil {
		logger.Error("copy plugin img dir error", "error", err)
	}

	pluginName := "plugin" + utils.MD5(fp.Id)
	s0 := fmt.Sprintf("\t'%s': %s,\n", fp.Module, pluginName)
	var s string
	if fp.Type == "panel" {
		s = fmt.Sprintf("import * as %s from '%s'; \n", pluginName, fp.Module)
	} else if fp.Type == "datasource" {
		s = fmt.Sprintf("const %s = async () => await import(/* webpackChunkName: '%s' */ '%s'); \n", pluginName, pluginName, fp.Module)
	}

	if isExternalPlugin(fp.PluginDir) {
		externalImports = append(externalImports, s)
		externalExport = append(externalExport, s0)
	} else {
		internalImports = append(internalImports, s)
		internalExport = append(internalExport, s0)
	}
}
