import { PanelPlugin } from 'src/packages/datav-core';

import { ClockPanel } from './ClockPanel';
import { ClockOptions } from './types';
import { optionsBuilder } from './options';

export const plugin = new PanelPlugin<ClockOptions>(ClockPanel).setNoPadding().setPanelOptions(optionsBuilder);
