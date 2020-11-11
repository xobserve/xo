import { DataSourcePlugin } from 'src/packages/datav-core/src';
import { JaegerDatasource } from './datasource';
import { JaegerQueryField } from './QueryField';
import { ConfigEditor } from './ConfigEditor';
import {QueryEditor} from './QueryEdtitor'
export const plugin = new DataSourcePlugin(JaegerDatasource)
  .setConfigEditor(ConfigEditor)
  // .setExploreQueryField(JaegerQueryField)
  .setQueryEditor(
    QueryEditor
  );
 