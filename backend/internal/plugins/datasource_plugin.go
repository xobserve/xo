package plugins

import (
	"encoding/json"

	"github.com/datav-io/datav/backend/pkg/utils/errutil"
)

type DataSourcePlugin struct {
	FrontendPluginBase
	Annotations  bool            `json:"annotations"`
	Metrics      bool            `json:"metrics"`
	Alerting     bool            `json:"alerting"`
	Explore      bool            `json:"explore"`
	Table        bool            `json:"tables"`
	Logs         bool            `json:"logs"`
	Tracing      bool            `json:"tracing"`
	QueryOptions map[string]bool `json:"queryOptions,omitempty"`
	BuiltIn      bool            `json:"builtIn,omitempty"`
	Mixed        bool            `json:"mixed,omitempty"`
	Routes       []*PluginRoute  `json:"routes"`
	Streaming    bool            `json:"streaming"`

	Executable string `json:"executable,omitempty"`
	SDK        bool   `json:"sdk,omitempty"`
}

func (p *DataSourcePlugin) Load(decoder *json.Decoder, pluginDir string) error {
	if err := decoder.Decode(p); err != nil {
		return errutil.Wrapf(err, "Failed to decode datasource plugin")
	}

	if err := p.registerPlugin(pluginDir); err != nil {
		return errutil.Wrapf(err, "Failed to register plugin")
	}

	// if p.Backend {
	// 	cmd := ComposePluginStartCommmand(p.Executable)
	// 	fullpath := path.Join(p.PluginDir, cmd)
	// 	descriptor := backendplugin.NewBackendPluginDescriptor(p.Id, fullpath, backendplugin.PluginStartFuncs{
	// 		OnLegacyStart: p.onLegacyPluginStart,
	// 		OnStart:       p.onPluginStart,
	// 	})
	// 	if err := backendPluginManager.Register(descriptor); err != nil {
	// 		return errutil.Wrapf(err, "Failed to register backend plugin")
	// 	}
	// }

	DataSources[p.Id] = p
	return nil
}
