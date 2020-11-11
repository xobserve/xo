import { DataSourcePlugin } from 'src/packages/datav-core/src';
import { ConfigEditor } from './ConfigEditor';
import { DataSource } from './DataSource';
import { QueryEditor } from './QueryEditor';
import { GenericOptions, GrafanaQuery } from './types';

class GenericAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export const plugin = new DataSourcePlugin<DataSource, GrafanaQuery, GenericOptions>(DataSource)
  .setAnnotationQueryCtrl(GenericAnnotationsQueryCtrl)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
