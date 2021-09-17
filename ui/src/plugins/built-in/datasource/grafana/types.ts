import { DataQuery } from 'src/packages/datav-core/src/data';
import { LiveDataFilter } from 'src/packages/datav-core/src/runtime';

//----------------------------------------------
// Query
//----------------------------------------------

export enum GrafanaQueryType {
  RandomWalk = 'randomWalk',
  LiveMeasurements = 'measurements',
  Annotations = 'annotations',
}

export interface GrafanaQuery extends DataQuery {
  queryType: GrafanaQueryType; // RandomWalk by default
  channel?: string;
  filter?: LiveDataFilter;
  buffer?: number;
}

export const defaultQuery: GrafanaQuery = {
  refId: 'A',
  queryType: GrafanaQueryType.RandomWalk,
};

//----------------------------------------------
// Annotations
//----------------------------------------------

export enum GrafanaAnnotationType {
  Dashboard = 'dashboard',
  Tags = 'tags',
}

export interface GrafanaAnnotationQuery extends GrafanaQuery {
  type: GrafanaAnnotationType; // tags
  limit: number; // 100
  tags?: string[];
  matchAny?: boolean; // By default Grafana only shows annotations that match all tags in the query. Enabling this returns annotations that match any of the tags in the query.
}
