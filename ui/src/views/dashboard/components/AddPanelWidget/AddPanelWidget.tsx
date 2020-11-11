// Libraries
import React, { useMemo } from 'react';
import _ from 'lodash';
import {getBootConfig } from 'src/packages/datav-core/src';
import {Button,Row} from 'antd'
import { DashboardModel, PanelModel } from '../../model';
import { LS_PANEL_COPY_KEY } from 'src/core/constants';
import {cx} from 'emotion';
import localStore from 'src/core/library/utils/localStore';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import './AddPanelWidget.less'
import {store} from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location';
import { FormattedMessage } from 'react-intl';

export type PanelPluginInfo = { id: any; defaults: { gridPos: { w: any; h: any }; title: any } };

export interface OwnProps {
  panel: PanelModel;
  dashboard: DashboardModel;
}


export type Props = OwnProps

const getCopiedPanelPlugins = () => {
  const panels = _.chain(getBootConfig().panels)
    .filter({ hideFromList: false })
    .map(item => item)
    .value();
  const copiedPanels = [];

  const copiedPanelJson = localStore.get(LS_PANEL_COPY_KEY);
  if (copiedPanelJson) {
    const copiedPanel = JSON.parse(copiedPanelJson);
    const pluginInfo: any = _.find(panels, { id: copiedPanel.type });
    if (pluginInfo) {
      const pluginCopy = _.cloneDeep(pluginInfo);
      pluginCopy.name = copiedPanel.title;
      pluginCopy.sort = -1;
      pluginCopy.defaults = copiedPanel;
      copiedPanels.push(pluginCopy);
    }
  }

  return _.sortBy(copiedPanels, 'sort');
};

export const AddPanelWidgetUnconnected: React.FC<Props> = ({ panel, dashboard }) => {
  const onCancelAddPanel = (evt: any) => {
    evt.preventDefault();
    dashboard.removePanel(panel);
  };

  const onCreateNewPanel = () => {
    const { gridPos } = panel;

    const newPanel: any = {
      type: 'graph',
      title: 'Panel Title',
      gridPos: { x: gridPos.x, y: gridPos.y, w: gridPos.w, h: gridPos.h },
    };

    dashboard.addPanel(newPanel);
    dashboard.removePanel(panel);


    store.dispatch(updateLocation({
      query: {editPanel: newPanel.id},
      partial: true,
    }))
  };

  const onPasteCopiedPanel = (panelPluginInfo: PanelPluginInfo) => {
    const { gridPos } = panel;

    const newPanel: any = {
      type: panelPluginInfo.id,
      title: 'Panel Title',
      gridPos: {
        x: gridPos.x,
        y: gridPos.y,
        w: panelPluginInfo.defaults.gridPos.w,
        h: panelPluginInfo.defaults.gridPos.h,
      },
    };

    // apply panel template / defaults
    if (panelPluginInfo.defaults) {
      _.defaults(newPanel, panelPluginInfo.defaults);
      newPanel.title = panelPluginInfo.defaults.title;
      localStore.delete(LS_PANEL_COPY_KEY);
    }

    dashboard.addPanel(newPanel);
    dashboard.removePanel(panel);
  };

  const onCreateNewRow = () => {
    const newRow: any = {
      type: 'row',
      title: 'Row title',
      gridPos: { x: 0, y: 0 },
    };

    dashboard.addPanel(newRow);
    dashboard.removePanel(panel);
  };

  return (
    <div className={cx('panel-container', 'add-panel-widget-wrapper')}>
      <AddPanelWidgetHandle onCancel={onCancelAddPanel} />
      <div className={'add-panel-widget-actions-wrapper'}>
        <AddPanelWidgetCreate onCreate={onCreateNewPanel} onPasteCopiedPanel={onPasteCopiedPanel} />
        <div>
            <Button onClick={onCreateNewRow}>
            <FormattedMessage id="dashboard.convertRow"/>
            </Button>
        </div>
      </div>
    </div>
  );
};


export const AddPanelWidget = AddPanelWidgetUnconnected

interface AddPanelWidgetHandleProps {
  onCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
const AddPanelWidgetHandle: React.FC<AddPanelWidgetHandleProps> = ({ onCancel }) => {
  return (
    <div className={cx('add-panel-widget-handle', 'grid-drag-handle')}>
      <CloseOutlined onClick={onCancel} className="add-panel-widget__close" />
    </div>
  );
};

interface AddPanelWidgetCreateProps {
  onCreate: () => void;
  onPasteCopiedPanel: (panelPluginInfo: PanelPluginInfo) => void;
}

const AddPanelWidgetCreate: React.FC<AddPanelWidgetCreateProps> = ({ onCreate, onPasteCopiedPanel }) => {
  const copiedPanelPlugins = useMemo(() => getCopiedPanelPlugins(), []);
  return (
    <div className={'add-panel-widget-create-wrapper'}>
        <Button type="primary" icon={<PlusOutlined />}  onClick={onCreate}>
           <FormattedMessage id="dashboard.addNewPanel"/>
        </Button>
        {copiedPanelPlugins.length === 1 && (
          <Button   onClick={() => onPasteCopiedPanel(copiedPanelPlugins[0])}>
            <FormattedMessage id="dashboard.pastePanel"/>
          </Button>
        )}
    </div>
  );
};


