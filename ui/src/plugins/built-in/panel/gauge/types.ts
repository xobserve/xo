import { VizOrientation, SelectableValue ,SingleStatBaseOptions} from 'src/packages/datav-core/src';

export interface GaugeOptions extends SingleStatBaseOptions {
  showThresholdLabels: boolean;
  showThresholdMarkers: boolean;
}

export const orientationOptions: Array<SelectableValue<VizOrientation>> = [
  { value: VizOrientation.Auto, label: 'Auto' },
  { value: VizOrientation.Horizontal, label: 'Horizontal' },
  { value: VizOrientation.Vertical, label: 'Vertical' },
];
