import { PanelPlugin } from 'src/packages/datav-core/src';
import { GraphFieldConfig, commonOptionsBuilder } from 'src/packages/datav-core/src/ui';
import { TimeSeriesPanel } from './TimeSeriesPanel';
import { TimeSeriesOptions } from './types';
import { defaultGraphConfig, getGraphFieldConfig } from './config';

export const plugin = new PanelPlugin<TimeSeriesOptions, GraphFieldConfig>(TimeSeriesPanel)
  .useFieldConfig(getGraphFieldConfig(defaultGraphConfig))
  .setPanelOptions((builder) => {
    commonOptionsBuilder.addTooltipOptions(builder);
    commonOptionsBuilder.addLegendOptions(builder);
  })
  .setDataSupport({ annotations: true, alertStates: true });
