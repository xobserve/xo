import React, { useCallback } from 'react';
import { IconName,  Tab, TabContent, TabsBar } from 'src/packages/datav-core/src/ui'; 
import { PanelEditorTab, PanelEditorTabId } from './types';
import { DashboardModel,PanelModel} from '../../model';
import { QueriesTab } from './Tabs/Query/QueryTab' 
import { AlertTab } from 'src/views/alerting/AlertTab'; 
import { TransformationsEditor } from './TransformationsEditor/TransformationsEditor';
import './PanelEditorTabs.less'

interface PanelEditorTabsProps {
  panel: PanelModel;
  dashboard: DashboardModel;
  tabs: PanelEditorTab[];
  onChangeTab: (tab: PanelEditorTab) => void;
}

export const PanelEditorTabs: React.FC<PanelEditorTabsProps> = ({ panel, dashboard, tabs, onChangeTab }) => {
  const activeTab = tabs.find(item => item.active);

  const getCounter = useCallback(
    (tab: PanelEditorTab) => {
      switch (tab.id) {
        case PanelEditorTabId.Query:
          return panel.targets.length;
        case PanelEditorTabId.Alert:
          return panel.alert ? 1 : 0;
        case PanelEditorTabId.Transform:
          const transformations = panel.getTransformations() ?? [];
          return transformations.length;
      }

      return null;
    },
    [panel]
  );

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={'panel-editor-tabs-wrapper'}>
      <TabsBar className={'tabBar'}>
        {tabs.map(tab => {
          return (
            <Tab
              key={tab.id}
              label={tab.text}
              active={tab.active}
              onChangeTab={() => onChangeTab(tab)}
              icon={tab.icon as IconName}
            />
          );
        })}
      </TabsBar>
      <TabContent className={'tabContent'}>
        {activeTab.id === PanelEditorTabId.Query && <QueriesTab panel={panel} dashboard={dashboard} />}
        {activeTab.id === PanelEditorTabId.Alert && <AlertTab panel={panel} dashboard={dashboard} />}
        {activeTab.id === PanelEditorTabId.Transform && <TransformationsEditor panel={panel} />}
      </TabContent>
    </div>
  );
};

