import { PanelPlugin } from 'src/packages/datav-core';
import { SimpleOptions } from './types';
import JaegerPanel  from './JagerPanel';

export const plugin = new PanelPlugin<SimpleOptions>(JaegerPanel).setPanelOptions(builder => {
  return builder
    .addBooleanSwitch({
      path: 'useVariable',
      name: 'Use variable as service name',
      defaultValue: false,
    })
    .addTextInput({
      path: 'variable',
      name: 'Variable',
      showIf: config => config.useVariable,
    });
});
