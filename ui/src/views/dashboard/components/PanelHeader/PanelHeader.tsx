import React, { Component } from 'react';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import { DataLink, LoadingState, PanelData, PanelMenuItem, QueryResultMetaNotice, ScopedVars} from 'src/packages/datav-core/src';
import {ClickOutsideWrapper, Icon} from 'src/packages/datav-core/src/ui'

import { PanelHeaderMenu } from './PanelHeaderMenu';
import templateSrv from 'src/core/services/templating';

import { DashboardModel,PanelModel} from '../../model';

import { getPanelMenu } from './getPanelMenu';
import {store} from 'src/store/store'
import {Tooltip} from 'antd' 
import './PanelHeader.less'
import { updateLocation } from 'src/store/reducers/location';
import {SyncOutlined} from '@ant-design/icons'
import {PanelHeaderCorner} from './PanelHeaderCorner'
import { getPanelLinksSupplier } from 'src/views/panel/panellinks/linkSuppliers';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  title?: string;
  description?: string;
  scopedVars?: ScopedVars;
  links?: DataLink[];
  error?: string;
  alertState?: string;
  isViewing: boolean;
  isEditing: boolean;
  data: PanelData;
}

interface ClickCoordinates {
  x: number;
  y: number;
}

interface State {
  panelMenuOpen: boolean;
  menuItems: PanelMenuItem[];
}

export class PanelHeader extends Component<Props, State> {
  clickCoordinates: ClickCoordinates = { x: 0, y: 0 };

  state: State = {
    panelMenuOpen: false,
    menuItems: [],
  };

  eventToClickCoordinates = (event: React.MouseEvent<HTMLDivElement>) => {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    this.clickCoordinates = this.eventToClickCoordinates(event);
  };

  isClick = (clickCoordinates: ClickCoordinates) => {
    return isEqual(clickCoordinates, this.clickCoordinates);
  };

  onMenuToggle = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!this.isClick(this.eventToClickCoordinates(event))) {
      return;
    }

    event.stopPropagation();

    const { dashboard, panel } = this.props;
    const menuItems = getPanelMenu(dashboard, panel);

    this.setState({
      panelMenuOpen: !this.state.panelMenuOpen,
      menuItems,
    });
  };

  closeMenu = () => {
    this.setState({
      panelMenuOpen: false,
    });
  };

  private renderLoadingState(): JSX.Element {
    return (
      <div className="panel-loading">
        <SyncOutlined spin translate />
      </div>
    );
  }

  openInspect = (e: React.SyntheticEvent, tab: string) => {
    const {panel } = this.props;

    e.stopPropagation();

    store.dispatch(updateLocation({
      query: { inspect: panel.id, inspectTab: tab },
      partial: true,
    }))
  };

  renderNotice = (notice: QueryResultMetaNotice) => {
    return (
      <Tooltip title={notice.text} key={notice.severity}>
        {notice.inspect ? (
          <div className="panel-info-notice pointer" onClick={e => this.openInspect(e, notice.inspect!)}>
            <Icon name="info-circle" style={{ marginRight: '8px' }} />
          </div>
        ) : (
          // eslint-disable-next-line 
          <a className="panel-info-notice" href={notice.link} target="_blank">
            <Icon name="info-circle" style={{ marginRight: '8px' }} />
          </a>
        )}
      </Tooltip>
    );
  };

  render() {
    const { panel, scopedVars,error, isViewing, isEditing, data, alertState } = this.props;
    const { menuItems } = this.state;
    const title = templateSrv.replaceWithText(panel.title, scopedVars);

    const panelHeaderClass = classNames({
      'panel-header': true,
      'grid-drag-handle': !(isViewing || isEditing),
    });

    // dedupe on severity
    const notices: Record<string, QueryResultMetaNotice> = {};

    for (const series of data.series) {
      if (series.meta && series.meta.notices) {
        for (const notice of series.meta.notices) {
          notices[notice.severity] = notice;
        }
      }
    } 

    return (
      <>
        {data.state === LoadingState.Loading && this.renderLoadingState()}
        <div className={panelHeaderClass}>
          <PanelHeaderCorner
            panel={panel}
            title={panel.title}
            description={panel.description}
            scopedVars={panel.scopedVars}
            links={getPanelLinksSupplier(panel)}
            error={error}
          />
          <div
            className="panel-title-container"
            onClick={this.onMenuToggle}
            onMouseDown={this.onMouseDown}
          >
            <div className="panel-title">
              {Object.values(notices).map(this.renderNotice)}
              {title !== '' && alertState && (
                <Icon 
                  name={alertState === 'alerting' ? 'heart-break' : 'heart'}
                  className="icon-gf panel-alert-icon"
                  style={{ marginRight: '4px' }}
                  size="sm"
                />
              )}
              <span className="panel-title-text">
                {title}
                {/* <Icon name="angle-down" className="panel-menu-toggle" /> */}
              </span>
              {this.state.panelMenuOpen && (
                <ClickOutsideWrapper onClick={this.closeMenu}>
                  <PanelHeaderMenu items={menuItems} />
                </ClickOutsideWrapper>
              )}
              {data.request && data.request.timeInfo && (
                <span className="panel-time-info">
                  <Icon name="clock-nine" size="sm" /> {data.request.timeInfo}
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
