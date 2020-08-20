import React, { PureComponent } from 'react';
import _ from 'lodash';
import { css } from 'emotion';
import { Alert, Button, IconName, CustomScrollbar, Container, HorizontalGroup, ConfirmModal, Modal } from 'src/packages/datav-core';
import { getDataSourceService, config} from 'src/packages/datav-core';
import { getAlertingValidationMessage, getDefaultCondition } from './getAlertingValidationMessage';

import EmptyListCTA from 'src/views/components/EmptyListCTA/EmptyListCTA';
import StateHistory from './StateHistory';

import { DashboardModel,PanelModel} from 'src/views/dashboard/model';
import { TestRuleResult } from './TestRuleResult';
import { AppNotificationSeverity } from 'src/types';

import { PanelEditorTabId } from '../dashboard/components/PanelEditor/types';
import { updateLocation } from 'src/store/reducers/location';
import kbn from 'src/core/library/utils/kbn';
import alertDef from './state/alertDef';
import { QueryPart } from 'src/views/components/QueryPart/queryPart';
import { ThresholdMapper } from './state/ThresholdMapper';

interface OwnProps {
  dashboard: DashboardModel;
  panel: PanelModel;
}


export type Props = OwnProps;

interface State {
  validatonMessage: string;
  showStateHistory: boolean;
  showDeleteConfirmation: boolean;
  showTestRule: boolean;
}

class UnConnectedAlertTab extends PureComponent<Props, State> {
  alert: any;
  frequencyWarning: string;
  conditionModels: any;
  notifications: any;
  alertNotifications: any;
  alertingMinIntervalSecs: number;
  alertingMinInterval: string;
  constructor(props) {
    super(props)

    this.alertingMinIntervalSecs = config.alertingMinInterval;
    this.alertingMinInterval = kbn.secondsToHms(config.alertingMinInterval);
    this.notifications = [];
    this.alertNotifications = [];

    this.state = {
      validatonMessage: '',
      showStateHistory: false,
      showDeleteConfirmation: false,
      showTestRule: false,
    }
  }

  componentDidMount() {
    this.loadAlertTab();
  }

  onAngularPanelUpdated = () => {
    this.forceUpdate();
  };

  componentDidUpdate(prevProps: Props) {
    this.loadAlertTab();
  }

  componentWillUnmount() {
  }

  async loadAlertTab() {
    const { panel } = this.props;

    const validatonMessage = await getAlertingValidationMessage(
      panel.transformations,
      panel.targets,
      getDataSourceService(),
      panel.datasource
    );

    if (validatonMessage) {
      this.setState({ validatonMessage });
    }
  }

  onAddAlert = () => {
    this.props.panel.alert = {
      for: '5m'
    };
    this.initAlertModel()
    this.forceUpdate();
  };

  initAlertModel() {
    const alert = (this.alert = this.props.panel.alert);
    if (!alert) {
      return;
    }

    this.checkFrequency();

    alert.conditions = alert.conditions || [];
    if (alert.conditions.length === 0) {
      alert.conditions.push(getDefaultCondition());
    }

    alert.noDataState = alert.noDataState || config.alertingNoDataOrNullValues;
    alert.executionErrorState = alert.executionErrorState || config.alertingErrorOrTimeout;
    alert.frequency = alert.frequency || '1m';
    alert.handler = alert.handler || 1;
    alert.notifications = alert.notifications || [];
    alert.for = alert.for || '0m';
    alert.alertRuleTags = alert.alertRuleTags || {};

    const defaultName = this.props.panel.title + ' alert';
    alert.name = alert.name || defaultName;

    this.conditionModels = _.reduce(
      alert.conditions,
      (memo, value) => {
        memo.push(this.buildConditionModel(value));
        return memo;
      },
      []
    );

    ThresholdMapper.alertToGraphThresholds(this.props.panel);

    for (const addedNotification of alert.notifications) {
      // lookup notifier type by uid
      let model: any = _.find(this.notifications, { uid: addedNotification.uid });

      // fallback to using id if uid is missing
      if (!model) {
        model = _.find(this.notifications, { id: addedNotification.id });
      }

      if (model && model.isDefault === false) {
        model.iconClass = this.getNotificationIcon(model.type);
        this.alertNotifications.push(model);
      }
    }

    for (const notification of this.notifications) {
      if (notification.isDefault) {
        notification.iconClass = this.getNotificationIcon(notification.type);
        this.alertNotifications.push(notification);
      }
    }

    this.props.panel.render();
  }

  buildConditionModel(source: any) {
    const cm: any = { source: source, type: source.type };

    cm.queryPart = new QueryPart(source.query, alertDef.alertQueryDef);
    cm.reducerPart = alertDef.createReducerPart(source.reducer);
    cm.evaluator = source.evaluator;
    cm.operator = source.operator;

    return cm;
  }


  getNotificationIcon(type: string): string {
    switch (type) {
      case 'email':
        return 'envelope';
      case 'slack':
        return 'slack';
      case 'victorops':
        return 'fa fa-pagelines';
      case 'webhook':
        return 'cube';
      case 'pagerduty':
        return 'fa fa-bullhorn';
      case 'opsgenie':
        return 'bell';
      case 'hipchat':
        return 'fa fa-mail-forward';
      case 'pushover':
        return 'mobile-android';
      case 'kafka':
        return 'arrow-random';
      case 'teams':
        return 'fa fa-windows';
    }
    return 'bell';
  }

  checkFrequency() {
    if (!this.alert.frequency) {
      return;
    }

    this.frequencyWarning = '';

    try {
      const frequencySecs = kbn.interval_to_seconds(this.alert.frequency);
      if (frequencySecs < this.alertingMinIntervalSecs) {
        this.frequencyWarning =
          'A minimum evaluation interval of ' +
          this.alertingMinInterval +
          ' have been configured in Grafana and will be used for this alert rule. ' +
          'Please contact the administrator to configure a lower interval.';
      }
    } catch (err) {
      this.frequencyWarning = err;
    }
  }

  switchToQueryTab = () => {
    updateLocation({ query: { tab: PanelEditorTabId.Query }, partial: true });
  };

  onToggleModal = (prop: keyof Omit<State, 'validatonMessage'>) => {
    const value = this.state[prop];
    this.setState({ ...this.state, [prop]: !value });
  };

  renderValidationMessage = () => {
    const { validatonMessage } = this.state;

    return (
      <div
        className={css`
          width: 508px;
          margin: 128px auto;
        `}
      >
        <h2>{validatonMessage}</h2>
        <br />
        <div className="gf-form-group">
          <Button size={'md'} variant={'secondary'} icon="arrow-left" onClick={this.switchToQueryTab}>
            Go back to Queries
          </Button>
        </div>
      </div>
    );
  };

  renderTestRule = () => {
    if (!this.state.showTestRule) {
      return null;
    }

    const { panel, dashboard } = this.props;
    const onDismiss = () => this.onToggleModal('showTestRule');

    return (
      <Modal isOpen={true} icon="bug" title="Testing rule" onDismiss={onDismiss} onClickBackdrop={onDismiss}>
        <TestRuleResult panel={panel} dashboard={dashboard} />
      </Modal>
    );
  };

  renderDeleteConfirmation = () => {
    if (!this.state.showDeleteConfirmation) {
      return null;
    }

    const { panel } = this.props;
    const onDismiss = () => this.onToggleModal('showDeleteConfirmation');

    return (
      <ConfirmModal
        isOpen={true}
        icon="trash-alt"
        title="Delete"
        body={
          <div>
            Are you sure you want to delete this alert rule?
            <br />
            <small>You need to save dashboard for the delete to take effect.</small>
          </div>
        }
        confirmText="Delete Alert"
        onDismiss={onDismiss}
        onConfirm={() => {
          delete panel.alert;
          panel.options.thresholds = [];
          this.props.panel.render();
          onDismiss();
        }}
      />
    );
  };

  renderStateHistory = () => {
    if (!this.state.showStateHistory) {
      return null;
    }

    const { panel, dashboard } = this.props;
    const onDismiss = () => this.onToggleModal('showStateHistory');

    return (
      <Modal isOpen={true} icon="history" title="State history" onDismiss={onDismiss} onClickBackdrop={onDismiss}>
        <StateHistory
          dashboard={dashboard}
          panelId={panel.editSourceId ?? panel.id}
          onRefresh={() => this.props.panel.refresh()}
        />
      </Modal>
    );
  };

  render() {
    const { alert, transformations } = this.props.panel;
    const { validatonMessage } = this.state;
    const hasTransformations = transformations && transformations.length > 0;

    if (!alert && validatonMessage) {
      return this.renderValidationMessage();
    }

    const model = {
      title: 'Panel has no alert rule defined',
      buttonIcon: 'bell' as IconName,
      onClick: this.onAddAlert,
      buttonTitle: 'Create Alert',
    };

    return (
      <>
        <CustomScrollbar autoHeightMin="100%">
          <Container padding="md">
            <div>
              {alert && hasTransformations && (
                <Alert
                  severity={AppNotificationSeverity.Error}
                  title="Transformations are not supported in alert queries"
                />
              )}

              {alert && (
                <HorizontalGroup>
                  <Button onClick={() => this.onToggleModal('showStateHistory')} variant="secondary">
                    State history
                  </Button>
                  <Button onClick={() => this.onToggleModal('showTestRule')} variant="secondary">
                    Test rule
                  </Button>
                  <Button onClick={() => this.onToggleModal('showDeleteConfirmation')} variant="destructive">
                    Delete
                  </Button>
                </HorizontalGroup>
              )}
              {!alert && !validatonMessage && <EmptyListCTA {...model} />}
            </div>
          </Container>
        </CustomScrollbar>

        {this.renderTestRule()}
        {this.renderDeleteConfirmation()}
        {this.renderStateHistory()}
      </>
    );
  }
}



export const AlertTab = UnConnectedAlertTab;
