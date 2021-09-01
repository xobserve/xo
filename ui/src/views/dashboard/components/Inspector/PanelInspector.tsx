import React, { useState } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { DashboardModel, PanelModel } from '../../model';
import { PanelPlugin } from 'src/packages/datav-core/src';
import { LocationSrv } from 'src/packages/datav-core/src/runtime';
import { StoreState } from 'src/types';

import { InspectContent } from './InspectContent';
import { useDatasourceMetadata, useInspectTabs } from './hooks';
import { useLocation } from 'react-router-dom';
import { GetDataOptions } from '../../model/PanelQueryRunner';
import { usePanelLatestData } from '../PanelEditor/OptionsPane/usePanelLatestData';
import { InspectTab } from 'src/views/components/inspector/types';
import { dispatch } from 'src/store/store';
import { updateLocation } from 'src/store/reducers/location';


interface OwnProps {
  dashboard: DashboardModel;
  panel: PanelModel;
}

export interface ConnectedProps {
  plugin?: PanelPlugin | null;
}

export type Props = OwnProps & ConnectedProps;

const PanelInspectorUnconnected: React.FC<Props> = ({ panel, dashboard, plugin }) => {
  const [dataOptions, setDataOptions] = useState<GetDataOptions>({
    withTransforms: false,
    withFieldConfig: true,
  });

  const location = useLocation();
  const { data, isLoading, error } = usePanelLatestData(panel, dataOptions);
  const metaDs = useDatasourceMetadata(data);
  const tabs = useInspectTabs(panel, dashboard, plugin, error, metaDs);
  const defaultTab = new URLSearchParams(location.search).get('inspectTab') as InspectTab;

  const onClose = () => {
    dispatch(
      updateLocation({
        query: { inspect: null, inspectTab: null },
        partial: true,
      })
    );
  };

  if (!plugin) {
    return null;
  }

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
