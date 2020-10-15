import {
  dateMath,
  DateTime,
  MutableDataFrame,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataQueryRequest,
  DataQueryResponse,
  DataQuery,
  FieldType,
} from 'src/packages/datav-core';
import _ from 'lodash'
import { getBackendSrv} from 'src/packages/datav-core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { getTimeSrv } from 'src/core/services/time';
import { DatasourceRequestOptions } from 'src/core/services/backend';
import { serializeParams } from 'src/core/library/utils/fetch';

export type JaegerQuery = {
  query: string;
  queryText?: string;
  constant?: number;
} & DataQuery;

export class JaegerDatasource extends DataSourceApi<JaegerQuery> {
  constructor(private instanceSettings: DataSourceInstanceSettings) {
    super(instanceSettings);
  }

  async metadataRequest(url: string, params?: Record<string, any>): Promise<any> {
    const res = await this._request(url, params, { silent: true }).toPromise();
    return res.data.data;
  }

  query(options: DataQueryRequest<JaegerQuery>): Observable<DataQueryResponse> {
    // At this moment we expect only one target. In case we somehow change the UI to be able to show multiple
    // traces at one we need to change this.
    const id = options.targets[0]?.query;
    if (id) {
      // TODO: this api is internal, used in jaeger ui. Officially they have gRPC api that should be used.
      return this._request(`/api/traces/${encodeURIComponent(id)}`).pipe(
        map(response => {
          return {
            data: [
              new MutableDataFrame({
                fields: [
                  {
                    name: 'trace',
                    type: FieldType.trace,
                    values: response?.data?.data || [],
                  },
                ],
                meta: {
                  preferredVisualisationType: 'trace',
                },
              }),
            ],
          };
        })
      );
    } else {
      return of({
        data: [
          new MutableDataFrame({
            fields: [
              {
                name: 'trace',
                type: FieldType.trace,
                values: [],
              },
            ],
            meta: {
              preferredVisualisationType: 'trace',
            },
          }),
        ],
      });
    }
  }

  async findServices() {
    const url = `/api/proxy/${this.instanceSettings.id}/api/services`
    
    
    const req = {
      url,
      method: 'GET',
      headers: {},
    };

    return  getBackendSrv().datasourceRequest(req);
  }

  async findOperations(service: string) {
    const url = `/api/services/${encodeURIComponent(service)}/operations`;
    try {
      return await this.metadataRequest(url)
    } catch (error) {
      alert('Failed to load operations from Jaeger')
    }
    return [];
  };

  async findTraces(options)  {
    const { from, to } = getTimeSrv().timeRange();

    options.start = from.unix() * 1000000
    options.end = to.unix() * 1000000

    const url = '/api/traces';
    try {
      return await this.metadataRequest(url, options);
    } catch (error) {
      console.log('Failed to load traces from Jaeger', error)
    }
    return [];
  };

  async findTrace(traceID) {
    const url = `/api/traces/${traceID}`
    try {
      return await this.metadataRequest(url);
    } catch (error) {
      console.log('Failed to load traces from Jaeger', error)
    }
    return null;
  }

  async testDatasource(): Promise<any> {
    const url = `/api/proxy/${this.instanceSettings.id}/api/services`
    
    
    const req = {
      url,
      method: 'GET',
      headers: {},
    };

    await getBackendSrv().datasourceRequest(req);

    return true;
  }

  getTimeRange(): { start: number; end: number } {
    const range = getTimeSrv().timeRange();
    return {
      start: getTime(range.from, false),
      end: getTime(range.to, true),
    };
  }

  getQueryDisplayText(query: JaegerQuery) {
    return query.query;
  }

  private _request(apiUrl: string, data?: any, options?: DatasourceRequestOptions): Observable<Record<string, any>> {
    // Hack for proxying metadata requests
    const baseUrl = `/api/proxy/${this.instanceSettings.id}`;
    const params = data ? serializeParams(data) : '';
    const url = `${baseUrl}${apiUrl}${params.length ? `?${params}` : ''}`;
    const req = {
      ...options,
      url,
    };

    return from(getBackendSrv().datasourceRequest(req));
  }
}

function getTime(date: string | DateTime, roundUp: boolean) {
  if (typeof date === 'string') {
    date = dateMath.parse(date, roundUp);
  }
  return date.valueOf() * 1000;
}
