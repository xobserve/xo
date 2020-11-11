import React from 'react';
import classNames from 'classnames';
import { Icon } from 'src/packages/datav-core/src';
import { PanelModel,DashboardModel} from '../../model';

import templateSrv from 'src/core/services/templating';
import appEvents from 'src/core/library/utils/app_events';
import { CoreEvents } from 'src/types';
import './Row.less'
import { Input,Modal,Button} from 'antd';
import { FormattedMessage } from 'react-intl';

export interface DashboardRowProps {
  panel: PanelModel;
  dashboard: DashboardModel;
}

interface State {
  collapsed: boolean
  deleteRowVisible: boolean
  editRowVisible: boolean
}

export class DashboardRow extends React.Component<DashboardRowProps, State> {
  constructor(props: DashboardRowProps) {
    super(props);

    this.state = {
      collapsed: this.props.panel.collapsed,
      deleteRowVisible: false,
      editRowVisible: false
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
    this.setState({
      ...this.state,
      editRowVisible: false
    })
  };

  onOpenSettings = () => {
    this.setState({
      ...this.state,
      editRowVisible: true
    })
  };

  onDelete = () => {
    this.setState({
      ...this.state,
      deleteRowVisible: true
    })
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
      <>
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

      <Modal
          visible={this.state.deleteRowVisible}
          title={<FormattedMessage id="dashboard.removeRow"/>}
          onCancel={() => this.setState({...this.state,deleteRowVisible:false})}
          footer={[
            <Button key="delete-row-only" onClick={() =>  this.props.dashboard.removeRow(this.props.panel, false)}>
              {<FormattedMessage id="dashboard.removeRowOnly"/>}
            </Button>,
            <Button key="delete-row" type="primary" onClick={() =>  this.props.dashboard.removeRow(this.props.panel, true)} danger>
              {<FormattedMessage id="common.remove"/>}
            </Button>,
            <Button key="cancel" type="primary" onClick={() => this.setState({...this.state,deleteRowVisible:false})}>
               {<FormattedMessage id="common.cancel"/>}
          </Button>,
          ]}
        >
          <p>{<FormattedMessage id="dashboard.removeRowConfirm"/>}</p>
        </Modal>

        <Modal
          visible={this.state.editRowVisible}
          title={<FormattedMessage id="dashboard.editRow"/>}
          onOk={this.onUpdate}
          onCancel={() => this.setState({...this.state,editRowVisible:false})}
        >
         <Input defaultValue={this.props.panel.title} onChange={(e) =>  this.props.panel.title = e.currentTarget.value}/>
        </Modal>
      </>
    );
  }
}
