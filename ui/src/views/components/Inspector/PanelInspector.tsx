/*eslint-disable*/
import React, { useCallback, useState } from 'react';
import { connect, MapStateToProps, useDispatch } from 'react-redux';

import { DashboardModel, PanelModel } from 'src/views/dashboard/model';

import { PanelPlugin } from 'src/packages/datav-core/src';
import { StoreState } from 'src/types';
import { GetDataOptions } from 'src/views/dashboard/model/PanelQueryRunner';

import { InspectContent } from './InspectContent';
import { useDatasourceMetadata, useInspectTabs } from './hooks';
import { InspectTab } from './types';

import { usePanelLatestData } from 'src/views/dashboard/components/PanelEditor/OptionsPane/usePanelLatestData';
import { updateLocation } from 'src/store/reducers/location';

interface OwnProps {
  dashboard: DashboardModel;
  panel: PanelModel;
  defaultTab?: InspectTab;
}

export interface ConnectedProps {
  plugin?: PanelPlugin | null;
}

export type Props = OwnProps & ConnectedProps;

const PanelInspectorUnconnected: React.FC<Props> = ({ panel, dashboard, defaultTab, plugin }) => {
  if (!plugin) {
    return null;
  }

  const dispatch = useDispatch();
  const [dataOptions, setDataOptions] = useState<GetDataOptions>({
    withTransforms: false,
    withFieldConfig: true,
  });
  const { data, isLoading, error } = usePanelLatestData(panel, dataOptions);
  const metaDs = useDatasourceMetadata(data);
  const tabs = useInspectTabs(plugin, dashboard, error, metaDs);
  const onClose = useCallback(() => {
    dispatch(
      updateLocation({
        query: { inspect: null, inspectTab: null },
        partial: true,
      })
    );
  }, [updateLocation]);

  return (
    <InspectContent
      dashboard={dashboard}
      panel={panel}
      plugin={plugin}
      defaultTab={defaultTab}
      tabs={tabs}
      data={data}
      isDataLoading={isLoading}
      dataOptions={dataOptions}
      onDataOptionsChange={setDataOptions}
      metadataDatasource={metaDs}
      onClose={onClose}
    />
  );
};

const mapStateToProps: MapStateToProps<ConnectedProps, OwnProps, StoreState> = (state, props) => {
  const panelState = state.dashboard.panels[props.panel.id];
  if (!panelState) {
    return { plugin: null };
  }

  return {
    plugin: panelState.plugin,
  };
};

export const PanelInspector = connect(mapStateToProps)(PanelInspectorUnconnected);
