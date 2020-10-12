import React from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceHttpSettings} from 'src/packages/datav-core';

export type Props = DataSourcePluginOptionsEditorProps;

export const ConfigEditor: React.FC<Props> = ({ options, onOptionsChange }) => {
  return (
    <>
      <DataSourceHttpSettings
        defaultUrl={'http://localhost:16686'}
        dataSourceConfig={options}
        showAccessOptions={true}
        onChange={onOptionsChange}
      />
    </>
  );
};
