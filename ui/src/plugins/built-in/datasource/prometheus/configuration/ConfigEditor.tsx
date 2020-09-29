import React from 'react';
import { DataSourceHttpSettings } from 'src/packages/datav-core'; 
import { DataSourcePluginOptionsEditorProps } from 'src/packages/datav-core';
import { PromSettings } from './PromSettings';
import { PromOptions } from '../types';

export type Props = DataSourcePluginOptionsEditorProps<PromOptions>;
export const ConfigEditor = (props: Props) => {
  const { options, onOptionsChange } = props;
  return (
    <>
      <DataSourceHttpSettings
        defaultUrl="http://10.77.64.59:9090"
        dataSourceConfig={options}
        showAccessOptions={true}
        onChange={onOptionsChange}
      />

      <PromSettings options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};
