import { TableSortByFieldState } from 'src/packages/datav-core/src';

export interface Options {
  frameIndex: number;
  showHeader: boolean;
  sortBy?: TableSortByFieldState[];
  enableRowClick: boolean;
  rowClickEvent: string
}

export interface TableSortBy {
  displayName: string;
  desc: boolean;
}

export interface CustomFieldConfig {
  width: number;
  displayMode: string;
}
