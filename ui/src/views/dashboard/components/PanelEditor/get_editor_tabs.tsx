import memoizeOne from 'memoize-one';
import { PanelPlugin,config} from 'src/packages/datav-core/src';
import { PanelEditorTab, PanelEditorTabId} from './types';
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store';

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
      text: localeData[getState().application.locale]['common.query'],
      icon: 'database',
      active: false,
    });

    tabs.push({
      id: PanelEditorTabId.Transform,
      text: localeData[getState().application.locale]['common.transform'],
      icon: 'process',
      active: false,
    });
  }

  if (config.alertingEnabled && plugin.meta.id === 'timeseries') {
    tabs.push({
      id: PanelEditorTabId.Alert,
      text: localeData[getState().application.locale]['common.alert'],
      icon: 'bell',
      active: false,
    });
  }
  
  const activeTab = tabs.find(item => item.id === (currentTab || defaultTab)) ?? tabs[0];
  activeTab.active = true;

  return tabs;
});
