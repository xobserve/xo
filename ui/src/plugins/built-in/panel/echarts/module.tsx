import { PanelPlugin } from 'src/packages/datav-core/src';
import { EchartsOptions, defaultOptions } from './types';
import EchartsPanel from './EchartsPanel';
import { OptionEditor } from './OptionEditor';
 
export const plugin = new PanelPlugin<EchartsOptions>(EchartsPanel)
    .setDefaults(defaultOptions)
    .setEditor(OptionEditor)
    .setNoPadding()