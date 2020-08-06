import memoizeOne from 'memoize-one';
import { PanelPlugin,config} from 'src/packages/datav-core';
import { PanelEditorTab, PanelEditorTabId} from './types';
import { getUrlParams } from 'src/core/library/utils/url';

export const getPanelEditorTabs = memoizeOne((plugin?: PanelPlugin) => {
  const tabs: PanelEditorTab[] = [];

  if (!plugin) {
    return tabs;
  }

  let defaultTab = PanelEditorTabId.Query;

  if (plugin.meta.skipDataQuery) {
    return [];
  }

  if (!plugin.meta.skipDataQuery) {
    defaultTab = PanelEditorTabId.Query;

    tabs.push({
      id: PanelEditorTabId.Query,
      text: 'Query',
      icon: 'database',
      active: false,
    });

    tabs.push({
      id: PanelEditorTabId.Transform,
      text: 'Transform',
      icon: 'process',
      active: false,
    });
  }

  if (config.alertingEnabled && plugin.meta.id === 'graph') {
    tabs.push({
      id: PanelEditorTabId.Alert,
      text: 'Alert',
      icon: 'bell',
      active: false,
    });
  }
  
  const activeTab = tabs.find(item => item.id === (getUrlParams().tab || defaultTab)) ?? tabs[0];
  activeTab.active = true;

  return tabs;
});
