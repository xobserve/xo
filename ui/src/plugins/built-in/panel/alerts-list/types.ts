type SeriesSize = 'sm' | 'md' | 'lg';

export interface AlertsListOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}
