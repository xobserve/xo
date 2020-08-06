import {DataSourceApi,  DataQuery,DataSourceJsonData,DataSourcePlugin} from 'src/packages/datav-core'
 
export type GenericDataSourcePlugin = DataSourcePlugin<DataSourceApi<DataQuery, DataSourceJsonData>>; 