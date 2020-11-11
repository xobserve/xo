import { DataSourcePlugin } from 'src/packages/datav-core/src';
import { DataSource } from './DataSource';
import { QueryEditor } from './QueryEditor';
import { StaticQuery, StaticDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, StaticQuery, StaticDataSourceOptions>(DataSource).setQueryEditor(
  QueryEditor
);
