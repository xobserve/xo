import { FeatureLike } from 'ol/Feature';

import { MapLayerState } from '../types';
import { SeriesData } from 'types/seriesData';

export interface DataHoverPayload {
    data?: SeriesData; // source data
    rowIndex?: number; // the hover row
    columnIndex?: number; // the hover column
    dataId?: string; // identifying string to correlate data between publishers and subscribers
  
    // When dragging, this will capture the point when the mouse was down
    point: Record<string, any>; // { time: 5678, lengthft: 456 }  // each axis|scale gets a value
    down?: Record<string, any>;
  }

export interface GeomapLayerHover {
  layer: MapLayerState;
  features: FeatureLike[];
}

export interface GeomapHoverPayload extends DataHoverPayload {
  // List of layers
  layers?: GeomapLayerHover[];

  // Global mouse coordinates for the hover layer
  pageX: number;
  pageY: number;
}
