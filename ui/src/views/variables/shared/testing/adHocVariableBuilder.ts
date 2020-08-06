import { AdHocVariableFilter, AdHocVariableModel } from 'src/types';
import { VariableBuilder } from './variableBuilder';

export class AdHocVariableBuilder extends VariableBuilder<AdHocVariableModel> {
  withDatasource(datasource: string) {
    this.variable.datasource = datasource;
    return this;
  }

  withFilters(filters: AdHocVariableFilter[]) {
    this.variable.filters = filters;
    return this;
  }
}
