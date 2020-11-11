import React, { PureComponent } from 'react';
import _ from 'lodash';
import { css } from 'emotion';
import { Alert, Button, Icon, IconName, CustomScrollbar, Container, HorizontalGroup, ConfirmModal, Modal, InlineFormLabel, getBackendSrv, currentLang, DataQuery, DataSourceApi } from 'src/packages/datav-core/src';
import { getDataSourceService, config } from 'src/packages/datav-core/src';
import { getAlertingValidationMessage, getDefaultCondition } from './getAlertingValidationMessage';

import EmptyListCTA from 'src/views/components/EmptyListCTA/EmptyListCTA';
import StateHistory from './StateHistory';

import { DashboardModel, PanelModel } from 'src/views/dashboard/model';
import { TestRuleResult } from './TestRuleResult';
import { AppNotificationSeverity, AlertNotification } from 'src/types';

import { PanelEditorTabId } from '../dashboard/components/PanelEditor/types';
import { updateLocation } from 'src/store/reducers/location';
import kbn from 'src/core/library/utils/kbn';
import alertDef from './state/alertDef';
import { ThresholdMapper } from './state/ThresholdMapper';
import { Select, InputNumber, notification as Notification, Input, Tooltip } from 'antd'
import localeData from 'src/core/library/locale';
import { NotifierPicker } from '../cfg/teams/team/Notifiers/Picker';
import { injectIntl, IntlShape, FormattedMessage } from 'react-intl';
import { Langs } from 'src/core/library/locale/types';


const { Option } = Select

interface OwnProps {
  dashboard: DashboardModel;
  panel: PanelModel;
}

interface IntlProps {
  intl: IntlShape
}

export type Props = OwnProps;

interface State {
  validatonMessage: string;
  showStateHistory: boolean;
  showDeleteConfirmation: boolean;
  showTestRule: boolean;
  frequencyWarning: string
  notifications: AlertNotification[]
  error: any
  conditionInEdit: number
  evaluatorInEdit: any
  sendExcepitonsInEdit: boolean
}

class UnConnectedAlertTab extends PureComponent<Props & IntlProps, State> {
  alertingMinIntervalSecs: number;
  alertingMinInterval: string;
  evalOperators: any;
  evalFunctions: any;
  constructor(props) {
    super(props)

    this.alertingMinIntervalSecs = config.alertingMinInterval;
    this.alertingMinInterval = kbn.secondsToHms(config.alertingMinInterval);
    this.evalOperators = alertDef.evalOperators
    this.evalFunctions = alertDef.evalFunctions;
    this.state = {
      validatonMessage: '',
      showStateHistory: false,
      showDeleteConfirmation: false,
      showTestRule: false,
      frequencyWarning: null,
      notifications: [],
      error: null,
      conditionInEdit: null,
      evaluatorInEdit: null,
      sendExcepitonsInEdit: false
    }
  }

  async componentDidMount() {
    // get all notifications this dashboard can use
    const res = await getBackendSrv().get(`/api/alerting/notification/${this.props.dashboard.meta.ownedBy}`)
    for (const n of res.data) {
      n.icon = this.getNotificationIcon(n.type)
    }

    this.setState({
      ...this.state,
      notifications: res.data
    })
    this.loadAlertTab();
    this.initAlertModel()
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
    const alert = this.props.panel.alert;
    if (!alert) {
      return;
    }

    this.checkFrequency(alert.frequency);

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
    alert.sendExceptions = alert.sendExceptions || [];
    const defaultName = this.props.panel.title + ' alert';
    alert.name = alert.name || defaultName;

    ThresholdMapper.alertToGraphThresholds(this.props.panel);

    for (const id of alert.notifications) {
      let model: any = _.find(this.state.notifications, { id: id });

      // notification not exist any more, set to to-remove state
      if (!model) {
        _.remove(this.props.panel.alert.notifications, (nid) => nid === id)
        Notification['error']({
          message: "Error",
          description: localeData[currentLang]['alerting.notificationNotExist'],
          duration: 5
        });
      }
    }

    for (const notification of this.state.notifications) {
      if (notification.isDefault) {
        // insert default notification into alert
        let exist = false
        for (const id of alert.notifications) {
          if (id === notification.id) {
            exist = true
          }
        }
        if (!exist) {
          alert.notifications.push(notification.id)
        }
      }
    }

    this.validateModel(alert)

    this.forceUpdate()
    this.props.panel.render();
  }

  validateModel(alert) {
    let firstTarget;
    let foundTarget: DataQuery = null;
    const promises: Array<Promise<any>> = [];
    for (const condition of alert.conditions) {
      if (condition.type !== 'query') {
        continue;
      }

      for (const target of this.props.panel.targets) {
        if (!firstTarget) {
          firstTarget = target;
        }
        if (condition.query.refId === target.refId) {
          foundTarget = target;
          break;
        }
      }

      if (!foundTarget) {
        if (firstTarget) {
          condition.query.refId = firstTarget.refId;
          foundTarget = firstTarget;
        } else {
          this.setState({
            ...this.state,
            error: localeData[currentLang]['alerting.metricNotFound']
          })
          return;
        }
      }

      const datasourceName = foundTarget.datasource || this.props.panel.datasource;
      promises.push(
        getDataSourceService().get(datasourceName).then(
          (foundTarget => (ds: DataSourceApi) => {
            if (!ds.meta.alerting) {
              return Promise.reject(localeData[currentLang]['alerting.dsNotSupport'])
            } else if (ds.targetContainsTemplate && ds.targetContainsTemplate(foundTarget)) {
              return Promise.reject(localeData[currentLang]['alerting.templateNotSupport']);
            }
            return Promise.resolve();
          })(foundTarget)
        )
      );
    }
    Promise.all(promises).then(
      () => { },
      e => {
        this.setState({
          ...this.state,
          error: e
        })
      }
    );
  }

  notificationAdded = (ids) => {
    this.props.panel.alert.notifications = ids
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
    return 'question';
  }

  checkFrequency = (v) => {
    if (!v) {
      return;
    }

    try {
      const frequencySecs = kbn.interval_to_seconds(v);
      if (frequencySecs < this.alertingMinIntervalSecs) {
        this.setState({
          frequencyWarning: this.props.intl.formatMessage({ id: "alerting.frequencyMinViolate" }, { interval: this.alertingMinInterval }),
        })

      } else {
        this.setState({
          frequencyWarning: null
        })
      }
    } catch (err) {
      this.setState({
        frequencyWarning: localeData[currentLang]['alerting.frequencyInvalid']
      })
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
        title={localeData[currentLang]['common.delete']}
        body={
          <div>
            <FormattedMessage id="alerting.deleteRuleConfirm" />
            <br />
            <small><FormattedMessage id="alerting.deleteRuleTips" /></small>
          </div>
        }
        confirmText={localeData[currentLang]['alerting.deleteConfirmText']}
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
      <Modal isOpen={true} icon="history" title={localeData[currentLang]['common.history']} onDismiss={onDismiss} onClickBackdrop={onDismiss}>
        <StateHistory
          dashboard={dashboard}
          panelId={panel.editSourceId ?? panel.id}
          onRefresh={() => this.props.panel.refresh()}
        />
      </Modal>
    );
  };

  evaluatorParamsChanged = () => {
    ThresholdMapper.alertToGraphThresholds(this.props.panel);
    this.props.panel.render();
  }

  addCondition = () => {
    const condition = getDefaultCondition();
    // add to persited model
    this.props.panel.alert.conditions.push(condition);

    // action above cant trigger a view re-render, so we need add ugly code here
    this.forceUpdate()
  }

  removeCondition = (i) => {
    const conditions = _.cloneDeep(this.props.panel.alert.conditions)
    conditions.splice(i, 1)
    this.props.panel.alert.conditions = conditions
    this.forceUpdate()
  }

  dismissEvaluatorInEdit = () => {
    const evaluator = _.cloneDeep(this.state.evaluatorInEdit)
    // 0. first param must be __Default
    // 1.cant use __Default as label name
    // 2.same label value cant exist under same label name
    const existMap = {}
    evaluator.params.forEach((param, i) => {
      if (i === 0 && param.labelName !== alertDef.defaultEvaluatorParamLabel) {
        Notification['error']({
          message: "Error",
          description: localeData[currentLang]['alerting.evaFirstParamError'],
          duration: 5
        });
        param.labelName = alertDef.defaultEvaluatorParamLabel
        param.labelValue = alertDef.defaultEvaluatorParamLabel
        return
      }

      if (i !== 0) {
        if (param.labelName === alertDef.defaultEvaluatorParamLabel) {
          Notification['error']({
            message: "Error",
            description: localeData[currentLang]['alerting.evalParamLabelUseDefault'],
            duration: 5
          });
          evaluator.params.splice(i, 1)
          return
        }

        const exist = existMap[param.labelName]
        if (exist === param.labelValue) {
          Notification['error']({
            message: "Error",
            description: localeData[currentLang]['alerting.evalParamSame'],
            duration: 5
          });
          evaluator.params.splice(i, 1)
          return
        }

        existMap[param.labelName] = param.labelValue
      }
    })
    this.props.panel.alert.conditions[this.state.conditionInEdit].evaluator = evaluator
    this.setState({
      ...this.state,
      evaluatorInEdit: null
    })

    this.evaluatorParamsChanged()

    this.forceUpdate()
  }

  addEvaluatorParam = () => {
    this.setState({
      ...this.state,
      evaluatorInEdit: {
        ...this.state.evaluatorInEdit,
        params: _.concat(this.state.evaluatorInEdit.params, [{ labelName: '', labelValue: '', value: [0.2, 1] }])
      }
    })
  }

  removeEvaluatorParam = (i) => {
    const evaluator = _.cloneDeep(this.state.evaluatorInEdit)
    evaluator.params.splice(i, 1)

    this.setState({
      ...this.state,
      evaluatorInEdit: evaluator
    })
  }

  dismissSendExceptionsEdit = () => {
    this.setState({
      ...this.state,
      sendExcepitonsInEdit: false
    })
  }

  addSendException = () => {
    this.props.panel.alert.sendExceptions.push({
      type: 'email',
      labelName: '',
      labelValue: '',
      setting: ''
    })
    this.forceUpdate()
  }

  removeSendException = (i) => {
    const exceptions = _.cloneDeep(this.props.panel.alert.sendExceptions)
    exceptions.splice(i, 1)

    this.props.panel.alert.sendExceptions = exceptions
    this.forceUpdate()
  }

  render() {
    const { transformations, alert, targets } = this.props.panel;
    const { validatonMessage, frequencyWarning, notifications, error, evaluatorInEdit, sendExcepitonsInEdit } = this.state;
    const hasTransformations = transformations && transformations.length > 0;

    if (!alert && validatonMessage) {
      return this.renderValidationMessage();
    }


    const model = {
      title: localeData[currentLang]['alerting.emptyAlertTitle'],
      buttonIcon: 'bell' as IconName,
      onClick: this.onAddAlert,
      buttonTitle: localeData[currentLang]['alerting.emptyAlertButton'],
    };

    return (
      <>
        <CustomScrollbar autoHeightMin="100%">
          <Container padding="md">
            <div>
              {
                error && <div className="alert alert-error m-b-2">
                  <Icon name="'exclamation-triangle'" /> {error}
                </div>
              }
              {alert && hasTransformations && (
                <Alert
                  severity={AppNotificationSeverity.Error}
                  title="Transformations are not supported in alert queries"
                />
              )}

              {alert && <div className="gf-form-group">
                <h4 className="section-heading"><FormattedMessage id="common.rule" /></h4>
                <div className="gf-form-inline">
                  <div className="gf-form">
                    <span className="gf-form-label width-5"><FormattedMessage id="common.name" /></span>
                    <input type="text" className="gf-form-input" defaultValue={alert.name} onChange={(e) => alert.name = e.currentTarget.value} />
                  </div>
                  <div className="gf-form">
                    <span className="gf-form-label width-7"><FormattedMessage id="alerting.evaluateEvery" /></span>
                    <input
                      className="gf-form-input max-width-5"
                      type="text"
                      defaultValue={alert.frequency}
                      onChange={(e) => this.props.panel.alert.frequency = e.currentTarget.value}
                      onBlur={(e) => this.checkFrequency(e.currentTarget.value)}
                    />
                  </div>
                  <div className="gf-form">
                    <InlineFormLabel className="gf-form-label" tooltip={localeData[currentLang]['alerting.forTooltip']}>
                      <FormattedMessage id="common.for" />
                    </InlineFormLabel>
                    <input
                      type="text"
                      className="gf-form-input max-width-10 gf-form-input--has-help-icon"
                      defaultValue={alert.for}
                      onChange={(e) => this.props.panel.alert.for = e.currentTarget.value}
                      placeholder="5m"
                      onBlur={(e) => this.checkFrequency(e.currentTarget.value)}
                    />
                  </div>
                </div>
                {frequencyWarning && <div className="gf-form">
                  <label className="gf-form-label text-warning">
                    <Icon name="'exclamation-triangle'"></Icon> {frequencyWarning}
                  </label>
                </div>}
              </div>}

              {alert &&
                <>
                  <div className="gf-form-group">
                    <h4 className="section-heading"><FormattedMessage id="alerting.conditions" />{currentLang === Langs.Chinese && <Tooltip title={<FormattedMessage id="alerting.conditionTips" />}><Icon name="info-circle" style={{ marginLeft: '10px' }} /></Tooltip>}</h4>
                    {
                      alert.conditions.map((c, i) => {
                        return <div className="gf-form-inline" key={i}>
                          <div className="gf-form">
                            {i === 0 ?
                              <span className="gf-form-label query-keyword width-5">WHEN</span> :
                              <span className="width-5 ub-mr2">
                                <Select value={c.operator} onChange={(v) => { c.operator = v; this.forceUpdate() }} style={{ width: '100%' }}>
                                  <Option value="and">AND</Option>
                                  <Option value="or">OR</Option>
                                </Select>
                              </span>
                            }
                            <Select className="width-5" value={c.reducer} onChange={(v) => { c.reducer = v; this.forceUpdate() }}>
                              {alertDef.reducerTypes.map((r, i) => <Option value={r.value} key={i}>{r.text}</Option>)}
                            </Select>
                            <span className="gf-form-label query-keyword width-5 ub-ml2">OF QUERY</span>
                            <Select className="width-4" value={c.query.refId} onChange={(v) => { c.query.refId = v; this.forceUpdate() }}>
                              {targets.map((r, i) => <Option value={r.refId} key={i}>{r.refId}</Option>)}
                            </Select>
                            <span className="gf-form-label query-keyword width-11 ub-ml2 pointer" onClick={() => this.setState({ ...this.state, evaluatorInEdit: c.evaluator, conditionInEdit: i })}>WITH LABELS AND VALUES</span>

                            <span className="gf-form-label query-keyword width-3">LAST</span>
                            <Select className="width-5" value={c.query.lastFor} onChange={(v) => { c.query.lastFor = v; this.forceUpdate() }}>
                              {alertDef.lastForOptions.map((r, i) => <Option value={r} key={i}>{r}</Option>)}
                            </Select>

                            <label className="gf-form-label dropdown pointer ub-ml2" onClick={() => this.removeCondition(i)}>
                              <Icon name="trash-alt" />
                            </label>
                          </div>

                        </div>
                      })
                    }
                    <div className="gf-form">
                      <label className="gf-form-label dropdown pointer" onClick={this.addCondition}>
                        <Icon name="plus-circle" />
                      </label>
                    </div>

                  </div>
                </>}

              {
                alert && <div className="gf-form-group">
                  <h4 className="section-heading"><FormattedMessage id="alerting.noDataTitle" /></h4>
                  <div className="gf-form-inline">
                    <div className="gf-form">
                      <span className="gf-form-label width-15"><FormattedMessage id="alerting.noDataLabel" /></span>
                    </div>
                    <div className="gf-form">
                      <span className="gf-form-label query-keyword"><FormattedMessage id="alerting.setStateTo" /></span>
                      <Select
                        className="width-10"
                        defaultValue={alert.noDataState}
                        onChange={(v) => this.props.panel.alert.noDataState = v}
                      >
                        {
                          alertDef.noDataModes.map((mode) =>
                            <Option value={mode.value} key={mode.value}>{mode.text}</Option>
                          )
                        }
                      </Select>
                    </div>
                  </div>

                  <div className="gf-form-inline">
                    <div className="gf-form">
                      <span className="gf-form-label width-15"><FormattedMessage id="alerting.excecutionErrorLabel" /></span>
                    </div>
                    <div className="gf-form">
                      <span className="gf-form-label query-keyword"><FormattedMessage id="alerting.setStateTo" /></span>
                      <Select
                        className="width-10"
                        defaultValue={alert.executionErrorState}
                        onChange={(v) => this.props.panel.alert.executionErrorState = v}
                      >
                        {
                          alertDef.executionErrorModes.map((mode) =>
                            <Option value={mode.value} key={mode.value}>{mode.text}</Option>
                          )
                        }
                      </Select>
                    </div>
                  </div>
                </div>
              }

              {
                alert && <div className="gf-form-group">
                  <h4 className="section-heading"><FormattedMessage id="common.notificationChannel" /></h4>
                  <div className="gf-form-inline">
                    <div className="gf-form">
                      <span className="gf-form-label width-8"><FormattedMessage id="alerting.sendTo" /></span>
                      <span className="gf-form-label query-keyword"><FormattedMessage id="alerting.commonCases" /></span>
                      <Select mode="multiple" defaultValue={alert.notifications} className="width-10" onChange={this.notificationAdded}>
                        {notifications.map((n) => <Option value={n.id} key={n.id}><Icon name={n.icon} /> <span className="ub-ml1">{n.name}</span></Option>)}
                      </Select>
                      <span className="gf-form-label query-keyword width-11 ub-ml2 pointer" onClick={() => this.setState({ ...this.state, sendExcepitonsInEdit: true })}><FormattedMessage id="alerting.setExcetpions" /></span>
                    </div>

                  </div>

                  <div className="gf-form gf-form--v-stretch">
                    <span className="gf-form-label width-8"><FormattedMessage id="common.message" /></span>
                    <Input.TextArea
                      className="gf-form-input"
                      rows={5}
                      defaultValue={alert.message}
                      onBlur={(e) => this.props.panel.alert.message = e.currentTarget.value}
                      placeholder={localeData[currentLang]['alerting.messagePlaceholder']}
                    ></Input.TextArea>
                  </div>
                </div>
              }

              {alert && (
                <HorizontalGroup>
                  <Button onClick={() => this.onToggleModal('showStateHistory')} variant="secondary">
                    <FormattedMessage id="common.history" />
                  </Button>
                  <Button onClick={() => this.onToggleModal('showTestRule')} variant="secondary">
                    <FormattedMessage id="alerting.testRule" />
                  </Button>
                  <Button onClick={() => this.onToggleModal('showDeleteConfirmation')} variant="destructive">
                    <FormattedMessage id="common.delete" />
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


        {evaluatorInEdit && <Modal isOpen={true} icon="edit" title="Edit condition labels ande values" onDismiss={this.dismissEvaluatorInEdit}>
          <>
            {evaluatorInEdit.params.map((param, i) => {
              return <div className="gf-form-inline" key={i}>
                <div className="gf-form">
                  <span className="gf-form-label query-keyword width-7 ub-ml2">WITH LABEL</span>
                  <Input placeholder="name" defaultValue={param.labelName} onChange={(e) => { param.labelName = e.currentTarget.value; this.forceUpdate() }} style={{ width: '100px' }} disabled={param.labelName === alertDef.defaultEvaluatorParamLabel}></Input>
                  <Input placeholder="value" defaultValue={param.labelValue} onChange={(e) => { param.labelValue = e.currentTarget.value; this.forceUpdate() }} style={{ width: '100px' }} disabled={param.labelName === alertDef.defaultEvaluatorParamLabel}></Input>

                  <Select className="width-11 ub-ml2" value={evaluatorInEdit.type} onChange={(v) => { evaluatorInEdit.type = v; this.forceUpdate() }}>
                    {alertDef.evalFunctions.map((r, i) => <Option value={r.value} key={i}>{r.text}</Option>)}
                  </Select>
                  {evaluatorInEdit.type !== 'no_value' && <InputNumber
                    className="ub-ml2 width-4"
                    value={param.value[0]}
                    onChange={(v) => { param.value[0] = v; this.forceUpdate() }}
                    placeholder="5"
                  />}
                  {(evaluatorInEdit.type === 'outside_range' || evaluatorInEdit.type === 'within_range') &&
                    <>
                      <span className="gf-form-label query-keyword width-2 ub-ml2">TO</span>
                      <InputNumber
                        className="width-4"
                        defaultValue={param.value[1]}
                        onChange={(v) => { param.value[1] = v; this.forceUpdate() }}
                        placeholder="5"
                      />
                    </>}

                  <span className="gf-form-label query-keyword width-3 ub-ml2">OR</span>

                  {param.labelName !== alertDef.defaultEvaluatorParamLabel && <label className="gf-form-label pointer" onClick={() => this.removeEvaluatorParam(i)}>
                    <Icon name="trash-alt" />
                  </label>}

                </div>
              </div>

            })}

            <div className="gf-form ub-ml2">
              <label className="gf-form-label dropdown pointer" onClick={this.addEvaluatorParam}>
                <Icon name="plus-circle" />
              </label>
            </div>
          </>
        </Modal>}

        {sendExcepitonsInEdit && <Modal isOpen={true} icon="edit" title={localeData[currentLang]['alerting.excepitonTitle']} onDismiss={this.dismissSendExceptionsEdit}>
          <>
            {alert.sendExceptions.map((exp, i) => {
              return <div className="gf-form-inline" key={i}>
                <span className="gf-form-label query-keyword width-7">LABEL</span>
                <Input placeholder="name" value={exp.labelName} onChange={(e) => { exp.labelName = e.currentTarget.value; this.forceUpdate() }} style={{ width: '100px' }} />
                <Input placeholder="value" value={exp.labelValue} onChange={(e) => { exp.labelValue = e.currentTarget.value; this.forceUpdate() }} style={{ width: '100px' }} />
                <span className="gf-form-label query-keyword width-7 ub-ml2">Type</span>
                <NotifierPicker value={exp.type} onChange={(v) => { exp.type = v; this.forceUpdate() }} />
                <span className="gf-form-label query-keyword width-7 ub-ml2">Setting</span>
                <Input placeholder="e.g test@gmail.com,ok@gmail.com" value={exp.setting} onChange={(e) => { exp.setting = e.currentTarget.value; this.forceUpdate() }} style={{ width: '300px' }} />
                <label className="gf-form-label pointer" onClick={() => this.removeSendException(i)}>
                  <Icon name="trash-alt" />
                </label>
              </div>
            })}

            <div className="gf-form ">
              <label className="gf-form-label dropdown pointer" onClick={this.addSendException}>
                <Icon name="plus-circle" />
              </label>
            </div>
          </>
        </Modal>}
      </>
    );
  }
}



export const AlertTab = injectIntl(UnConnectedAlertTab);
