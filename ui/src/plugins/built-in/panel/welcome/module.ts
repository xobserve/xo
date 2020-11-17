import { PanelPlugin } from 'src/packages/datav-core/src';
import { WelcomeBanner } from './Welcome';
import './locale'

export const plugin = new PanelPlugin(WelcomeBanner).setNoPadding();
