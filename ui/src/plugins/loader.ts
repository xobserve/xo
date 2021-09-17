import { DataSourcePluginMeta, PanelPlugin, PanelPluginMeta, PluginState, PluginType, getBootConfig } from 'src/packages/datav-core/src'
import { GenericDataSourcePlugin } from './settings'
import { builtInPlugins } from './built_in_plugins'
import { externalPlugins } from './external_plugins'
import { getPanelPluginNotFound, getPanelPluginLoadError } from 'src/views/dashboard/PanelPluginError'
import { getBackendSrv } from 'src/core/services/backend/backend';
import { getDatasourceSrv } from 'src/core/services/datasource';
import { message } from 'antd'
import { store } from 'src/store/store';
import { setPanelPlugin } from 'src/store/reducers/plugins';


export async function importPluginModule(path: string): Promise<any> {
  const builtIn = builtInPlugins[path];
  if (builtIn) {
    // for handling dynamic imports
    if (typeof builtIn === 'function') {
      return await builtIn();
    } else {
      return Promise.resolve(builtIn);
    }
  } 

  const external = externalPlugins[path]
  if (external) {
    // for handling dynamic imports
    if (typeof external === 'function') {
      return await external();
    } else {
      return Promise.resolve(external);
    }
  } 

  console.log("plugin not found:",path)
  return Promise.reject('no plugin found')
}


export function importDataSourcePlugin(meta: DataSourcePluginMeta): Promise<GenericDataSourcePlugin> {
  return importPluginModule(meta.module).then(pluginExports => {
    if (pluginExports.plugin) {
      const dsPlugin = pluginExports.plugin as GenericDataSourcePlugin;
      dsPlugin.meta = meta;
      return dsPlugin;
    }
    console.log("import plugin error,plugin: ", pluginExports)
    throw new Error('Plugin module is missing DataSourcePlugin or Datasource constructor export');
  })
}

interface PanelCache {
  [key: string]: Promise<PanelPlugin>;
}
const panelCache: PanelCache = {};

export function importPanelPlugin(id: string): Promise<PanelPlugin> {
  const loaded = panelCache[id];

  if (loaded) {
    return loaded;
  }

  const meta = getBootConfig().panels[id]
  if (!meta) {
    return Promise.resolve(getPanelPluginNotFound(id));
  }

  panelCache[id] = importPluginModule(meta.module)
    .then(pluginExports => {
      if (pluginExports.plugin) {
        return pluginExports.plugin as PanelPlugin;
      }
      throw new Error('missing export plugin:' + meta.type);
    })
    .then(plugin => {
      plugin.meta = meta;
      return plugin;
    })
    .catch(err => {
      // TODO, maybe a different error plugin
      console.log('Error loading panel plugin: ' + id);
      console.log(err)
      return getPanelPluginLoadError(meta);
    });

  return panelCache[id];
}

// export function loadDataSource(id: number){
//     const dataSource = await getBackendSrv().get(`/api/datasources/${id}`);
//     const pluginInfo = (await getPluginSettings(dataSource.type)) as DataSourcePluginMeta;
//     const plugin = await importDataSourcePlugin(pluginInfo);
//   };
// }


export async function loadDataSourcePlugin(datasourceType: string) {
  const meta = getBootConfig().datasourceMetas[datasourceType]
  const plugin = await importDataSourcePlugin(meta);
  return plugin
}

export async function testDataSource(dataSourceName: string) {
  const dsApi = await getDatasourceSrv().get(dataSourceName);

  if (!dsApi.testDatasource) {
    return;
  }

  return dsApi.testDatasource();
};


export async function loadPanelPlugin(id:string): Promise<PanelPlugin> {
  let plugin = store.getState().plugins.panels[id]
  if (!plugin) {
    plugin = await importPanelPlugin(id)
    // store plugin 
    store.dispatch(setPanelPlugin(plugin))
  }

  return plugin
}

