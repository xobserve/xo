package plugins

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/savecost/datav/backend/internal/registry"
	"github.com/savecost/datav/backend/pkg/config"
	"github.com/savecost/datav/backend/pkg/log"
	"github.com/savecost/datav/backend/pkg/utils"
	"github.com/savecost/datav/backend/pkg/utils/errutil"
	"golang.org/x/xerrors"
)

var logger = log.RootLogger.New("logger", "plugins")
var (
	DataSources  map[string]*DataSourcePlugin
	Panels       map[string]*PanelPlugin
	Plugins      map[string]*PluginBase
	PluginTypes  map[string]interface{}
	StaticRoutes []*PluginStaticRoute
)

type PluginManager struct {
	scanningErrors []error
}

func init() {
	registry.RegisterService(&PluginManager{})
}

func (p *PluginManager) Init() error {
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

	for _, panel := range Panels {
		panel.initFrontendPlugin()
	}

	for _, ds := range DataSources {
		ds.initFrontendPlugin()
	}

	for _, p := range Plugins {
		if p.IsCorePlugin {
			p.Signature = PluginSignatureInternal
		} else {
		}
	}

	return nil
}

// scan a directory for plugins.
func (pm *PluginManager) scan(pluginDir string, requireSigned bool) error {
	logger.Info("start scan plugin dir", "dir", pluginDir)
	scanner := &PluginScanner{
		pluginPath:    pluginDir,
		requireSigned: requireSigned,
	}

	if err := utils.Walk(pluginDir, true, true, scanner.walker); err != nil {
		if xerrors.Is(err, os.ErrNotExist) {
			logger.Debug("Couldn't scan directory since it doesn't exist", "pluginDir", pluginDir)
			return nil
		}
		if xerrors.Is(err, os.ErrPermission) {
			logger.Debug("Couldn't scan directory due to lack of permissions", "pluginDir", pluginDir)
			return nil
		}
		if pluginDir != "data/plugins" {
			logger.Warn("Could not scan dir", "pluginDir", pluginDir, "error", err)
		}
		return err
	}

	if len(scanner.errors) > 0 {
		logger.Warn("Some plugins failed to load", "errors", scanner.errors)
		pm.scanningErrors = scanner.errors
	}

	return nil
}

type PluginScanner struct {
	pluginPath    string
	errors        []error
	requireSigned bool
}

func (scanner *PluginScanner) walker(currentPath string, f os.FileInfo, err error) error {
	// We scan all the subfolders for plugin.json (with some exceptions) so that we also load embedded plugins, for
	// example https://github.com/raintank/worldping-app/tree/master/dist/grafana-worldmap-panel worldmap panel plugin
	// is embedded in worldping app.
	if err != nil {
		return err
	}

	if f.Name() == "node_modules" || f.Name() == "Chromium.app" {
		return utils.ErrWalkSkipDir
	}

	if f.IsDir() {
		return nil
	}

	if f.Name() == "plugin.json" {
		err := scanner.loadPlugin(currentPath)
		if err != nil {
			logger.Error("Failed to load plugin", "pluginPath", filepath.Dir(currentPath), "error", err)
			scanner.errors = append(scanner.errors, err)
		}
	}
	return nil
}

func (scanner *PluginScanner) loadPlugin(pluginJsonFilePath string) error {
	currentDir := filepath.Dir(pluginJsonFilePath)
	reader, err := os.Open(pluginJsonFilePath)
	if err != nil {
		return err
	}

	defer reader.Close()

	jsonParser := json.NewDecoder(reader)
	pluginCommon := PluginBase{}
	if err := jsonParser.Decode(&pluginCommon); err != nil {
		return err
	}

	if pluginCommon.Id == "" || pluginCommon.Type == "" {
		return errors.New("did not find type or id properties in plugin.json")
	}

	pluginCommon.PluginDir = filepath.Dir(pluginJsonFilePath)

	pluginGoType, exists := PluginTypes[pluginCommon.Type]
	if !exists {
		return fmt.Errorf("unknown plugin type %q", pluginCommon.Type)
	}
	loader := reflect.New(reflect.TypeOf(pluginGoType)).Interface().(PluginLoader)

	if !strings.HasPrefix(pluginJsonFilePath, config.Data.Server.StaticRootPath) {
		module := filepath.Join(filepath.Dir(pluginJsonFilePath), "module.js")
		exists, err := utils.FileExists(module)
		if err != nil {
			return err
		}
		if !exists {
			logger.Warn("Plugin missing module.js",
				"name", pluginCommon.Name,
				"warning", "Missing module.js, If you loaded this plugin from git, make sure to compile it.",
				"path", module)
		}
	}

	if _, err := reader.Seek(0, 0); err != nil {
		return err
	}

	return loader.Load(jsonParser, currentDir)
}

func getPluginMarkdown(pluginId string, name string) ([]byte, error) {
	plug, exists := Plugins[pluginId]
	if !exists {
		return nil, PluginNotFoundError{pluginId}
	}

	path := filepath.Join(plug.PluginDir, fmt.Sprintf("%s.md", strings.ToUpper(name)))

	exists, err := utils.FileExists(path)
	if err != nil {
		return nil, err
	}
	if !exists {
		path = filepath.Join(plug.PluginDir, fmt.Sprintf("%s.md", strings.ToLower(name)))
	}

	exists, err = utils.FileExists(path)
	if err != nil {
		return nil, err
	}
	if !exists {
		return make([]byte, 0), nil
	}

	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func generatePluginFile() {
	// generate plugin import file
	internalImportStr := "/*This file is auto generated by datav, changes will not have any effect*/ \n"
	externalImportStr := "/*This file is auto generated by datav, changes will not have any effect*/ \n"

	for _, s := range internalImports {
		internalImportStr += s
	}

	internalImportStr += "export const builtInPlugins = { \n"
	for _, s := range internalExport {
		internalImportStr += s
	}

	internalImportStr += `}`

	for _, s := range externalImports {
		externalImportStr += s
	}

	externalImportStr += "export const externalPlugins = { \n"
	for _, s := range externalExport {
		externalImportStr += s
	}

	externalImportStr += `}`

	// write import str to file
	internalFile := "./ui/src/plugins/built_in_plugins.ts"
	externalFile := "./ui/src/plugins/external_plugins.ts"

	if checkFileIsExist(internalFile) { //如果文件存在
		os.Create(internalFile)
	}

	err := ioutil.WriteFile(internalFile, []byte(internalImportStr), 0666)
	if err != nil {
		logger.Crit("open plugin file error", "error", err)
	}

	if checkFileIsExist(externalFile) { //如果文件存在
		os.Create(externalFile)
	}

	err = ioutil.WriteFile(externalFile, []byte(externalImportStr), 0666)
	if err != nil {
		logger.Crit("open plugin file error", "error", err)
	}
}

func checkFileIsExist(filename string) bool {
	var exist = true
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		exist = false
	}
	return exist
}
