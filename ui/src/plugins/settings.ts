import {DataSourceApi,  DataQuery,DataSourceJsonData,DataSourcePlugin} from 'src/packages/datav-core/src'
 
export type GenericDataSourcePlugin = DataSourcePlugin<DataSourceApi<DataQuery, DataSourceJsonData>>; 