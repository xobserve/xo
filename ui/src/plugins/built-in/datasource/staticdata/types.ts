import { DataQuery, DataSourceJsonData, DataFrameDTO, FieldType } from 'src/packages/datav-core/src';

export type NullableString = string | null;

export interface Field {
  name: string;
  type: FieldType;
}

export interface DataFrameViewModel {
  name?: string;
  fields: Field[];
  rows: NullableString[][];
}

export interface StaticQuery extends DataQuery {
  frame: DataFrameDTO;
}

export interface StaticDataSourceOptions extends DataSourceJsonData {}

export interface StaticSecureJsonData {}
