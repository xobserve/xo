import { getBootConfig, PanelPlugin } from 'src/packages/datav-core/src';
import { WelcomeBanner } from './Welcome';
import './locale'
import {WelcomeOptions} from './types'

export const plugin = new PanelPlugin<WelcomeOptions>(WelcomeBanner).setNoPadding().setPanelOptions(builder => {
    return builder
    .addBooleanSwitch({
        path: 'showDocs',
        category: ['Options'],
        name: 'Show docs',
        defaultValue: true,
      })
      
      .addTextInput({
        path: 'docsAddr',
        name: 'Docs root addr',
        description: `If set to empty, use system's docs addr instead`,
        category: ['Options'],
        defaultValue: getBootConfig().common.docsAddr,
      })
    
      .addBooleanSwitch({
        path: 'showGithub',
        category: ['Options'],
        name: 'Show github',
        defaultValue: true,
      })
      
      .addTextInput({
        path: 'githubAddr',
        name: 'Github addr',
        category: ['Options'],
        defaultValue: "https://github.com/opendatav/datav",
      })
  });
