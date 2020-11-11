import React, { PureComponent } from 'react';
import _ from 'lodash';
import {
  DataSourceSettings,
  DataSourcePlugin,
  DataSourceApi,
  DataQuery,
  DataSourceJsonData,
  DataSourcePluginMeta
} from 'src/packages/datav-core/src';
export type GenericDataSourcePlugin = DataSourcePlugin<DataSourceApi<DataQuery, DataSourceJsonData>>;

export interface Props {
  plugin: GenericDataSourcePlugin;
  dataSource: DataSourceSettings;
  dataSourceMeta: DataSourcePluginMeta;
  onChange: (dataSource: DataSourceSettings) => void
}

export class PluginSettings extends PureComponent<Props> {
  element: any;

  render() {
    const { plugin, dataSource } = this.props;

    if (!plugin) {
      return null;
    }

    return ( 
      <div ref={element => (this.element = element)}>
        {plugin.components.ConfigEditor &&
          React.createElement(plugin.components.ConfigEditor, {
            options: dataSource,
            onOptionsChange: this.props.onChange,
          })}
      </div>
    );
  }
}

export default PluginSettings;
