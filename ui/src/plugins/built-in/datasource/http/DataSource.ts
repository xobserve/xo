import { DataQueryResponse, DataSourceApi, DataSourceInstanceSettings,AnnotationEvent,AnnotationQueryRequest} from 'src/packages/datav-core/src';
import { getBackendSrv, getTemplateSrv } from 'src/packages/datav-core/src';
import { isEqual, isObject } from 'lodash';
import {
  GenericOptions,
  GrafanaQuery,
  MetricFindTagKeys,
  MetricFindTagValues,
  MetricFindValue,
  MultiValueVariable,
  QueryRequest,
  TextValuePair,
} from './types';

const supportedVariableTypes = ['adhoc', 'constant', 'custom', 'query', 'textbox'];

export class DataSource extends DataSourceApi<GrafanaQuery, GenericOptions> {
  url: string;
  withCredentials: boolean;
  headers: any;

  constructor(instanceSettings: DataSourceInstanceSettings<GenericOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url === undefined ? '' : instanceSettings.url;

    this.withCredentials = instanceSettings.withCredentials !== undefined;
    this.headers = { 'Content-Type': 'application/json' };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options: QueryRequest): Promise<DataQueryResponse> {
    const request = this.processTargets(options);

    if (request.targets.length === 0) {
      return Promise.resolve({ data: [] });
    }

    // @ts-ignore
    request.adhocFilters = getTemplateSrv().getAdhocFilters(this.name);

    options.scopedVars = { ...this.getVariables(), ...options.scopedVars };

    return this.doRequest({
      url: `${this.url}/query`,
      data: request,
      method: 'POST',
    });
  }

  testDatasource(): Promise<any> {
    return this.doRequest({
      url: this.url,
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return { status: 'success', message: 'Data source is working', title: 'Success' };
      }

      return {
        status: 'error',
        message: `Data source is not working: ${response.message}`,
        title: 'Error',
      };
    });
  }

  metricFindQuery(query: string, options?: any, type?: string): Promise<MetricFindValue[]> {
    const interpolated = {
      type,
      target: getTemplateSrv().replace(query, undefined, 'regex'),
    };

    return this.doRequest({
      url: `${this.url}/search`,
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  getTagKeys(options?: any): Promise<MetricFindTagKeys[]> {
    return new Promise(resolve => {
      this.doRequest({
        url: `${this.url}/tag-keys`,
        method: 'POST',
        data: options,
      }).then((result: any) => {
        return resolve(result.data);
      });
    });
  }

  getTagValues(options: any): Promise<MetricFindTagValues[]> {
    return new Promise(resolve => {
      this.doRequest({
        url: `${this.url}/tag-values`,
        method: 'POST',
        data: options,
      }).then((result: any) => {
        return resolve(result.data);
      });
    });
  }

  annotationQuery(
    options: AnnotationQueryRequest<GrafanaQuery & { query: string; iconColor: string }>
  ): Promise<AnnotationEvent[]> {
    const query = getTemplateSrv().replace(options.annotation.query, {}, 'glob');

    const annotationQuery = {
      annotation: {
        query,
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
      },
      range: options.range,
      rangeRaw: options.rangeRaw,
      variables: this.getVariables(),
    };

    return this.doRequest({
      url: `${this.url}/annotations`,
      method: 'POST',
      data: annotationQuery,
    }).then((result: any) => {
      return result.data;
    });
  }

  mapToTextValue(result: any) {
    return result.data.map((d: any, i: any) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      }

      if (isObject(d)) {
        return { text: d, value: i };
      }
      return { text: d, value: d };
    });
  }

  doRequest(options: any) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return getBackendSrv().datasourceRequest(options);
  }

  processTargets(options: QueryRequest) {
    options.targets = options.targets
      .filter(target => {
        // remove placeholder targets
        return target.target !== undefined;
      })
      .map(target => {
        if (target.data.trim() !== '') {
          target.data = JSON.parse(target.data, (key, value) => {
            if (typeof value === 'string') {
              return value.replace((getTemplateSrv() as any).regex, match => this.cleanMatch(match, options));
            }

            return value;
          });
        }

        if (typeof target.target === 'string') {
          target.target = getTemplateSrv().replace(target.target.toString(), options.scopedVars, 'regex');
        }

        return target;
      });

    return options;
  }

  cleanMatch(match: string, options: any) {
    const replacedMatch = getTemplateSrv().replace(match, options.scopedVars, 'json');
    if (
      typeof replacedMatch === 'string' &&
      replacedMatch[0] === '"' &&
      replacedMatch[replacedMatch.length - 1] === '"'
    ) {
      return JSON.parse(replacedMatch);
    }
    return replacedMatch;
  }

  getVariables() {
    const variables: { [id: string]: TextValuePair } = {};
    Object.values(getTemplateSrv().getVariables()).forEach(variable => {
      if (!supportedVariableTypes.includes(variable.type)) {
        console.warn(`Variable of type "${variable.type}" is not supported`);

        return;
      }

      if (variable.type === 'adhoc') {
        // These are being added to request.adhocFilters
        return;
      }

      const supportedVariable = variable as MultiValueVariable;

      let variableValue = supportedVariable.current.value;
      if (variableValue === '$__all' || isEqual(variableValue, ['$__all'])) {
        if (supportedVariable.allValue === null || supportedVariable.allValue === '') {
          variableValue = supportedVariable.options.slice(1).map(textValuePair => textValuePair.value);
        } else {
          variableValue = supportedVariable.allValue;
        }
      }

      variables[supportedVariable.id] = {
        text: supportedVariable.current.text,
        value: variableValue,
      };
    });

    return variables;
  }
}