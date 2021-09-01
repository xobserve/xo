import React, { useState } from 'react';
import { config, DataSourceApi, PanelData, PanelPlugin } from 'src/packages/datav-core/src';
import { getTemplateSrv } from 'src/packages/datav-core/src/runtime';
import { CustomScrollbar, Drawer, TabContent } from 'src/packages/datav-core/src/ui';
import { getPanelInspectorStyles } from 'src/views/components/inspector/styles';
import { InspectMetadataTab } from 'src/views/components/inspector/InspectMetadataTab';
import { InspectSubtitle } from 'src/views/components/inspector/InspectSubtitle';
import { InspectJSONTab } from 'src/views/components/inspector/InspectJSONTab';
import { QueryInspector } from 'src/views/components/inspector/QueryInspector';
import { InspectStatsTab } from 'src/views/components/inspector/InspectStatsTab';
import { InspectErrorTab } from 'src/views/components/inspector/InspectErrorTab';
import { InspectDataTab } from 'src/views/components/inspector/InspectDataTab';
import { InspectTab } from 'src/views/components/inspector/types';
import { DashboardModel, PanelModel } from '../../model';

import { InspectActionsTab } from './PanelInspectActions';
import { GetDataOptions } from '../../model/PanelQueryRunner';

interface Props {
  dashboard: DashboardModel;
  panel: PanelModel;
  plugin?: PanelPlugin | null;
  defaultTab?: InspectTab;
  tabs: Array<{ label: string; value: InspectTab }>;
  // The last raw response
  data?: PanelData;
  isDataLoading: boolean;
  dataOptions: GetDataOptions;
  // If the datasource supports custom metadata
  metadataDatasource?: DataSourceApi;
  onDataOptionsChange: (options: GetDataOptions) => void;
  onClose: () => void;
}

export const InspectContent: React.FC<Props> = ({
  panel,
  plugin,
  dashboard,
  tabs,
  data,
  isDataLoading,
  dataOptions,
  metadataDatasource,
  defaultTab,
  onDataOptionsChange,
  onClose,
}) => {
  const [currentTab, setCurrentTab] = useState(defaultTab ?? InspectTab.Data);

  if (!plugin) {
    return null;
  }

  const styles = getPanelInspectorStyles();
  const error = data?.error;

  // Validate that the active tab is actually valid and allowed
  let activeTab = currentTab;
  if (!tabs.find((item) => item.value === currentTab)) {
    activeTab = InspectTab.JSON;
  }
  const title = getTemplateSrv().replace(panel.title, panel.scopedVars, 'text');

  return (
    <Drawer
      title={`Inspect: ${title || 'Panel'}`}
      subtitle={
        <InspectSubtitle
          tabs={tabs}
          tab={activeTab}
          data={data}
          onSelectTab={(item) => setCurrentTab(item.value || InspectTab.Data)}
        />
      }
      width="50%"
      onClose={onClose}
      expandable
    >
      {activeTab === InspectTab.Data && (
        <InspectDataTab
          panel={panel}
          data={data && data.series}
          isLoading={isDataLoading}
          options={dataOptions}
          onOptionsChange={onDataOptionsChange}
        />
      )}
      <CustomScrollbar autoHeightMin="100%">
        <TabContent className={styles.tabContent}>
          {data && activeTab === InspectTab.Meta && (
            <InspectMetadataTab data={data} metadataDatasource={metadataDatasource} />
          )}

          {activeTab === InspectTab.JSON && (
            <InspectJSONTab panel={panel} dashboard={dashboard} data={data} onClose={onClose} />
          )}
          {activeTab === InspectTab.Error && <InspectErrorTab error={error} />}
          {data && activeTab === InspectTab.Stats && <InspectStatsTab data={data} timeZone={config.timePicker.timezone} />}
          {data && activeTab === InspectTab.Query && (
            <QueryInspector panel={panel} data={data.series} onRefreshQuery={() => panel.refresh()} />
          )}
          {activeTab === InspectTab.Actions && <InspectActionsTab panel={panel} data={data} />}
        </TabContent>
      </CustomScrollbar>
    </Drawer>
  );
};
