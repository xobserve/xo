import { Dimension, Dimensions } from 'src/packages/datav-core/src';

export interface GraphPanelOptions  {
  lines: boolean
  linewidth: number
  fill:number 
  fillGradient:number
  bars: boolean
  steppedLine: boolean
  points: boolean
  pointradius: number
  stack: boolean
  enableClickEvent: boolean;
  clickEvent: string
  seriesOverrides: any[]
}

export interface DataWarning {
  title: string;
  tip: string;
  action?: () => void;
  actionText?: string;
}
  
export interface GraphDimensions extends Dimensions {
  xAxis: Dimension<number>;
  yAxis: Dimension<number>;
}