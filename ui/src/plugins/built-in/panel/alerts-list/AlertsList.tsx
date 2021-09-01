import React, { PureComponent } from 'react';
import _ from 'lodash'
import { PanelProps,  getBackendSrv, dateTimeFormat,GrafanaTheme } from 'src/packages/datav-core/src';
import { AlertsListOptions } from './types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme,Icon,withTheme } from 'src/packages/datav-core/src/ui';
import { getTimeSrv } from 'src/core/services/time';
import { AlertHistory } from 'src/types';
import AlertHistoryList from 'src/views/alerting/AlertHistoryList';
import alertDef from 'src/views/alerting/state/alertDef';
import './AlertsList.less'
import { FormattedMessage } from 'react-intl';
interface Props extends PanelProps<AlertsListOptions> {
  theme: GrafanaTheme
}
interface State {
  alerts: AlertHistory[]
}

class AlertsList extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      alerts: []
    }
  }

  componentDidMount() {
    this.queryAlerts()
  }
  
  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.options, this.props.options)){
          this.queryAlerts()
    }

    if (!_.isEqual(prevProps.timeRange,this.props.timeRange)) {
      this.queryAlerts()
    }
  }

  queryAlerts = async () => {
    const options: any = _.cloneDeep(this.props.options)
    if (options.currentTimeRange) {
      options.from = getTimeSrv().timeRange().from.unix()
      options.to = getTimeSrv().timeRange().to.unix()
    }

    const res = await getBackendSrv().post('/api/alerting/history/filter', options)
    const alerts = res.data.map((item: any) => {
      item.stateModel = alertDef.getStateDisplayModel(item.state)
      item.time = dateTimeFormat(item.time, {
       format : 'MMM D, YYYY HH:mm:ss',
       timeZone: getTimeSrv().timezone,
     })
     item.info =  alertDef.getAlertAnnotationInfo(item.matches)
     return item
   });
    this.setState({
      ...this.state,
      alerts: alerts
    })
  }

  render() {
    const { options, data, width, height, theme } = this.props
    const { alerts } = this.state

    const styles = getStyles();
    return (
      <div className="panel-alert-list">
        {alerts.length === 0 && <div className="panel-alert-list__no-alerts">
          <div><Icon name="smile-wink" size="xxxl" className="color-primary"/></div>
            <div className="alerts-health"><FormattedMessage id="alertsList.healthTips"/></div>
          </div>}

        {alerts.length !== 0 &&
          <AlertHistoryList histories={alerts} enableSnapshot/>
        }
      </div>
    );
  }
}



export default withTheme(AlertsList)

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
