import { ScopedVars, DataSourceApi, DataSourceInstanceSettings } from '../../data/types';

/**
 * This is the entry point for communicating with a datasource that is added as
 * a plugin (both external and internal). Via this service you will get access
 * to the {DataSourceApi | DataSourceApi} that have a rich API for
 * communicating with the datasource.
 *
 * @public
 */
export interface DataSourceService {
  /**
   * @param name - name of the datasource plugin you want to use.
   * @param scopedVars - variables used to interpolate a templated passed as name.
   */
  get(name?: string, scopedVars?: ScopedVars): Promise<DataSourceApi>;

  /**
   * Returns metadata based on UID.
   */
  getDataSourceSettingsByUid(uid: string): DataSourceInstanceSettings | undefined;
}

let singletonInstance: DataSourceService;

/**
 * Used during startup by Grafana to set the DataSourceSrv so it is available
 * via the the {@link getDataSourceSrv} to the rest of the application.
 *
 * @internal
 */
export function setDataSourceService(instance: DataSourceService) {
  singletonInstance = instance;
}

/**
 * Used to retrieve the {@link DataSourceSrv} that is the entry point for communicating with
 * a datasource that is added as a plugin (both external and internal).
 *
 * @public
 */
export function getDataSourceService(): DataSourceService {
  return singletonInstance;
}
