import _ from 'lodash';
import { DataQuery } from 'src/packages/datav-core/src';

export const getNextRefIdChar = (queries: DataQuery[]): string | undefined => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return _.find(letters, refId => {
    return _.every(queries, other => {
      return other.refId !== refId;
    });
  });
};

export function addQuery(queries: DataQuery[], query?: Partial<DataQuery>): DataQuery[] {
  const q = query || {};
  q.refId = getNextRefIdChar(queries);
  return [...queries, q as DataQuery];
}


export function isDataQuery(url: string): boolean {
  if (
    url.indexOf('api/datasources/proxy') !== -1 ||
    url.indexOf('api/tsdb/query') !== -1 ||
    url.indexOf('api/ds/query') !== -1
  ) {
    return true;
  }

  return false;
}

export function isLocalUrl(url: string) {
  return !url.match(/^http/);
}
