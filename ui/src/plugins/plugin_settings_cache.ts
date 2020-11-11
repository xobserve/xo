import { getBackendSrv,PluginMeta} from 'src/packages/datav-core/src';

type PluginCache = {
  [key: string]: PluginMeta;
};

const pluginInfoCache: PluginCache = {};

export function getPluginSettings(pluginId: string): Promise<PluginMeta> {
  const v = pluginInfoCache[pluginId];
  if (v) {
    return Promise.resolve(v);
  }
  return getBackendSrv()
    .get(`/api/plugins/setting`,{
      id: pluginId
  })
    .then((res: any) => {
      pluginInfoCache[pluginId] = res.data;
      return res.data;
    })
    .catch((err: any) => {
      // err.isHandled = true;
      return Promise.reject('Unknown Plugin');
    });
}
