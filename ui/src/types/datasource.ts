import {DataSourcePluginMeta} from 'src/packages/datav-core'

export interface DataSourceResponse<T> {
    data: T;
    readonly status: number;
    readonly statusText: string;
    readonly ok: boolean;
    readonly headers: Headers;
    readonly redirected: boolean;
    readonly type: ResponseType;
    readonly url: string;
    readonly config: any;
  }

  export interface DataSourcePluginCategory {
    id: string;
    title: string;
    plugins: DataSourcePluginMeta[];
  }