package plugins

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/datadefeat/datav/backend/pkg/config"
	"github.com/datadefeat/datav/backend/pkg/models"
)

var (
	PluginTypeApp        = "app"
	PluginTypeDatasource = "datasource"
	PluginTypePanel      = "panel"
	PluginTypeDashboard  = "dashboard"
)

type PluginState string

var (
	PluginStateAlpha PluginState = "alpha"
	PluginStateBeta  PluginState = "beta"
)

type PluginSignature string

const (
	PluginSignatureInternal PluginSignature = "internal" // core plugin, no signature
	PluginSignatureValid    PluginSignature = "valid"    // signed and accurate MANIFEST
	PluginSignatureInvalid  PluginSignature = "invalid"  // invalid signature
	PluginSignatureModified PluginSignature = "modified" // valid signature, but content mismatch
	PluginSignatureUnsigned PluginSignature = "unsigned" // no MANIFEST file
)

type PluginNotFoundError struct {
	PluginId string
}

func (e PluginNotFoundError) Error() string {
	return fmt.Sprintf("Plugin with id %s not found", e.PluginId)
}

type PluginLoader interface {
	Load(decoder *json.Decoder, pluginDir string) error
}

type PluginBase struct {
	Type         string             `json:"type"`
	Name         string             `json:"name"`
	Id           string             `json:"id"`
	Info         PluginInfo         `json:"info"`
	Dependencies PluginDependencies `json:"dependencies"`
	Includes     []*PluginInclude   `json:"includes"`
	Module       string             `json:"module"`
	BaseUrl      string             `json:"baseUrl"`
	HideFromList bool               `json:"hideFromList,omitempty"`
	Preload      bool               `json:"preload"`
	State        PluginState        `json:"state,omitempty"`
	Signature    PluginSignature    `json:"signature"`
	// metrics, logs, tracing ,http
	Category     string             `json:"category"`

	PluginDir       string `json:"-"`
	IsCorePlugin    bool   `json:"-"`

	GrafanaNetVersion   string `json:"-"`
	GrafanaNetHasUpdate bool   `json:"-"`
}

func (pb *PluginBase) registerPlugin(pluginDir string) error {
	if _, exists := Plugins[pb.Id]; exists {
		return fmt.Errorf("Plugin with ID %q already exists", pb.Id)
	}

	if !strings.HasPrefix(pluginDir, config.Data.Common.StaticRootPath) {
		logger.Info("Registering plugin","name", pb.Name)
	}

	if len(pb.Dependencies.Plugins) == 0 {
		pb.Dependencies.Plugins = []PluginDependencyItem{}
	}

	if pb.Dependencies.DatavVersion == "" {
		pb.Dependencies.DatavVersion = "*"
	}

	for _, include := range pb.Includes {
		if include.Role == "" {
			include.Role = models.ROLE_VIEWER
		}
	}

	pb.PluginDir = pluginDir
	Plugins[pb.Id] = pb
	return nil
}

type PluginDependencies struct {
	DatavVersion string                 `json:"grafanaVersion"`
	Plugins      []PluginDependencyItem `json:"plugins"`
}

type PluginInclude struct {
	Name       string          `json:"name"`
	Path       string          `json:"path"`
	Type       string          `json:"type"`
	Component  string          `json:"component"`
	Role       models.RoleType `json:"role"`
	AddToNav   bool            `json:"addToNav"`
	DefaultNav bool            `json:"defaultNav"`
	Slug       string          `json:"slug"`

	Id string `json:"-"`
}

type PluginDependencyItem struct {
	Type    string `json:"type"`
	Id      string `json:"id"`
	Name    string `json:"name"`
	Version string `json:"version"`
}

type PluginBuildInfo struct {
	Time   int64  `json:"time,omitempty"`
	Repo   string `json:"repo,omitempty"`
	Branch string `json:"branch,omitempty"`
	Hash   string `json:"hash,omitempty"`
}

type PluginInfo struct {
	Author      PluginInfoLink      `json:"author"`
	Description string              `json:"description"`
	Links       []PluginInfoLink    `json:"links"`
	Logos       PluginLogos         `json:"logos"`
	Build       PluginBuildInfo     `json:"build"`
	Screenshots []PluginScreenshots `json:"screenshots"`
	Version     string              `json:"version"`
	Updated     string              `json:"updated"`
}

type PluginInfoLink struct {
	Name string `json:"name"`
	Url  string `json:"url"`
}

type PluginLogos struct {
	Small string `json:"small"`
	Large string `json:"large"`
}

type PluginScreenshots struct {
	Path string `json:"path"`
	Name string `json:"name"`
}

type PluginStaticRoute struct {
	Directory string
	PluginId  string
}

type EnabledPlugins struct {
	Panels      []*PanelPlugin
	DataSources map[string]*DataSourcePlugin
}

func NewEnabledPlugins() EnabledPlugins {
	return EnabledPlugins{
		Panels:      make([]*PanelPlugin, 0),
		DataSources: make(map[string]*DataSourcePlugin),
	}
}


type PluginListItem struct {
	Name          string                  `json:"name"`
	Type          string                  `json:"type"`
	Id            string                  `json:"id"`
	Enabled       bool                    `json:"enabled"`
	Pinned        bool                    `json:"pinned"`
	Info          *PluginInfo     `json:"info"`
	LatestVersion string                  `json:"latestVersion"`
	HasUpdate     bool                    `json:"hasUpdate"`
	DefaultNavUrl string                  `json:"defaultNavUrl"`
	Category      string                  `json:"category"`
	State         PluginState     `json:"state"`
	Signature     PluginSignature `json:"signature"`
}

type PluginList []PluginListItem

func (slice PluginList) Len() int {
	return len(slice)
}

func (slice PluginList) Less(i, j int) bool {
	return slice[i].Name < slice[j].Name
}

func (slice PluginList) Swap(i, j int) {
	slice[i], slice[j] = slice[j], slice[i]
}

type PluginSetting struct {
	Name          string                      `json:"name"`
	Type          string                      `json:"type"`
	Id            string                      `json:"id"`
	Enabled       bool                        `json:"enabled"`
	Pinned        bool                        `json:"pinned"`
	Module        string                      `json:"module"`
	BaseUrl       string                      `json:"baseUrl"`
	Info          *PluginInfo         `json:"info"`
	Includes      []*PluginInclude    `json:"includes"`
	Dependencies  *PluginDependencies `json:"dependencies"`
	JsonData      map[string]interface{}      `json:"jsonData"`
	DefaultNavUrl string                      `json:"defaultNavUrl"`

	LatestVersion string                  `json:"latestVersion"`
	HasUpdate     bool                    `json:"hasUpdate"`
	State         PluginState     `json:"state"`
	Signature     PluginSignature `json:"signature"`
}