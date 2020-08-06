import memoizeOne from 'memoize-one';
import { PanelPlugin,config} from 'src/packages/datav-core';
import { PanelEditorTab, PanelEditorTabId} from './types';


export const getPanelEditorTabs = memoizeOne((plugin: PanelPlugin,currentTab:string) => {
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
  
  const activeTab = tabs.find(item => item.id === (currentTab || defaultTab)) ?? tabs[0];
  activeTab.active = true;

  return tabs;
});
