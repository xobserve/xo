import { DataSourcePlugin } from 'src/packages/datav-core';
import { TestDataDataSource } from './datasource';
import { QueryEditor } from './QueryEditor';
import { TestInfoTab } from './TestInfoTab';
import { ConfigEditor } from './ConfigEditor';


export const plugin = new DataSourcePlugin(TestDataDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .addConfigPage({
    title: 'Setup',
    icon: 'list-ul',
    body: TestInfoTab,
    id: 'setup',
  });
