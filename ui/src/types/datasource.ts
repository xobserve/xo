import {DataSourcePluginMeta} from 'src/packages/datav-core/src'

  export interface DataSourcePluginCategory {
    id: string;
    title: string;
    plugins: DataSourcePluginMeta[];
  }