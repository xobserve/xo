import { PanelPlugin } from 'src/packages/datav-core/src';
import { GaugePanel } from './GaugePanel';
import { GaugeOptions } from './types';
import { addStandardDataReduceOptions } from '../stat/types';

export const plugin = new PanelPlugin<GaugeOptions>(GaugePanel)
  .useFieldConfig()
  .setPanelOptions(builder => {
    addStandardDataReduceOptions(builder);
    builder
      .addBooleanSwitch({
        path: 'showThresholdLabels',
        name: 'Show threshold labels',
        description: 'Render the threshold values around the gauge bar',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'showThresholdMarkers',
        name: 'Show threshold markers',
        description: 'Renders the thresholds as an outer bar',
        defaultValue: true,
      });
  })
