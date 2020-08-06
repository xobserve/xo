import { MultiVariableBuilder } from './multiVariableBuilder';
import { DataSourceVariableModel, VariableRefresh } from 'src/types';

export class DatasourceVariableBuilder<T extends DataSourceVariableModel> extends MultiVariableBuilder<T> {
  withRefresh(refresh: VariableRefresh) {
    this.variable.refresh = refresh;
    return this;
  }

  withRegEx(regex: any) {
    this.variable.regex = regex;
    return this;
  }
}
