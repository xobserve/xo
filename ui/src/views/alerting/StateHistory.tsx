import React, { PureComponent } from 'react';
import { getBackendSrv } from 'src/packages/datav-core';
import { Icon, ConfirmButton, Button } from 'src/packages/datav-core';

import alertDef from './state/alertDef';
import { DashboardModel } from 'src/views/dashboard/model/DashboardModel';
import { css } from 'emotion';
import AlertHistoryList from './AlertHistoryList'
interface Props {
  dashboard: DashboardModel;
  panelId: number;
  onRefresh: () => void;
}

interface State {
  stateHistoryItems: any;
}

class StateHistory extends PureComponent<Props, State> {
  state: State = {
    stateHistoryItems: [],
  };

  componentDidMount(): void {
    const { dashboard, panelId } = this.props;

    getBackendSrv()
      .get(
        `/api/alerting/history`,
        {
          type : 'panel',
          dashId: dashboard.id,
          panelId: panelId
        },
        `state-history-${dashboard.id}-${panelId}`
      )
      .then(res => {
        const data = res.data
        const items = data.map((item: any) => {
          return {
            stateModel: alertDef.getStateDisplayModel(item.state),
            time: dashboard.formatDate(item.time, 'MMM D, YYYY HH:mm:ss'),
            info: alertDef.getAlertAnnotationInfo(item.matches),
          };
        });

        this.setState({
          stateHistoryItems: items,
        });
      });
  }


  render() {
    const { stateHistoryItems } = this.state;

    return (
      <AlertHistoryList histories={stateHistoryItems} />
    );
  }
}

export default StateHistory;
