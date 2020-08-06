import React from 'react';
import classNames from 'classnames';
import { Icon } from 'src/packages/datav-core';
import { PanelModel,DashboardModel} from '../../model';

import templateSrv from 'src/core/services/templating';
import appEvents from 'src/core/library/utils/app_events';
import { CoreEvents } from 'src/types';
import './Row.less'
import { Input } from 'antd';

export interface DashboardRowProps {
  panel: PanelModel;
  dashboard: DashboardModel;
}

export class DashboardRow extends React.Component<DashboardRowProps, any> {
  constructor(props: DashboardRowProps) {
    super(props);

    this.state = {
      collapsed: this.props.panel.collapsed,
    };

    this.props.dashboard.on(CoreEvents.templateVariableValueUpdated, this.onVariableUpdated);
  }

  componentWillUnmount() {
    this.props.dashboard.off(CoreEvents.templateVariableValueUpdated, this.onVariableUpdated);
  }

  onVariableUpdated = () => {
    this.forceUpdate();
  };

  onToggle = () => {
    this.props.dashboard.toggleRow(this.props.panel);

    this.setState((prevState: any) => {
      return { collapsed: !prevState.collapsed };
    });
  };

  onUpdate = () => {
    this.props.dashboard.processRepeats();
    this.forceUpdate();
  };

  onOpenSettings = () => {
    appEvents.emit(CoreEvents.showModal, {
        title: 'Row title',        
        component: <Input defaultValue={this.props.panel.title} onChange={(e) =>  this.props.panel.title = e.currentTarget.value}/>,
        onConfirm: this.onUpdate
    });
  };

  onDelete = () => {
    appEvents.emit(CoreEvents.showConfirmModal, {
      title: 'Delete Row',
      text: 'Are you sure you want to remove this row and all its panels?',
      altActionText: 'Delete row only',
      icon: 'fa-trash',
      onConfirm: () => {
        this.props.dashboard.removeRow(this.props.panel, true);
      },
      onAltAction: () => {
        this.props.dashboard.removeRow(this.props.panel, false);
      },
    });
  };

  render() {
    const classes = classNames({
      'dashboard-row': true,
      'dashboard-row--collapsed': this.state.collapsed,
    });

    const title = templateSrv.replaceWithText(this.props.panel.title, this.props.panel.scopedVars);
    const count = this.props.panel.panels ? this.props.panel.panels.length : 0;
    const panels = count === 1 ? 'panel' : 'panels';
    const canEdit = this.props.dashboard.meta.canEdit === true;

    return (
      <div className={classes}>
        <a className="dashboard-row__title pointer" onClick={this.onToggle}>
          <Icon name={this.state.collapsed ? 'angle-right' : 'angle-down'} />
          {title}
          <span className="dashboard-row__panel_count">
            ({count} {panels})
          </span>
        </a>
        {canEdit && (
          <div className="dashboard-row__actions">
            <a className="pointer" onClick={this.onOpenSettings}>
              <Icon name="cog" />
            </a>
            <a className="pointer" onClick={this.onDelete}>
              <Icon name="trash-alt" />
            </a>
          </div>
        )}
        {this.state.collapsed === true && (
          <div className="dashboard-row__toggle-target" onClick={this.onToggle}>
            &nbsp;
          </div>
        )}
        {canEdit && <div className="dashboard-row__drag grid-drag-handle" />}
      </div>
    );
  }
}
