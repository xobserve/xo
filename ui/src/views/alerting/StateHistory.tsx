import React, { PureComponent } from 'react';
import { getBackendSrv } from 'src/packages/datav-core';
import { Icon, ConfirmButton, Button } from 'src/packages/datav-core';

import alertDef from './state/alertDef';
import { DashboardModel } from 'src/views/dashboard/model/DashboardModel';
import { css } from 'emotion';

interface Props {
  dashboard: DashboardModel;
  panelId: number;
  onRefresh: () => void;
}

interface State {
  stateHistoryItems: any[];
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
      <div>
        {stateHistoryItems.length > 0 && (
          <div className="p-b-1">
            <span className="muted">Last 50 alert history</span>
          </div>
        )}
        <ol className="alert-rule-list ub-mt2">
          {stateHistoryItems.length > 0 ? (
            stateHistoryItems.map((item, index) => {
              return (
                <li className="alert-rule-item" key={`${item.time}-${index}`}>
                  <div className={`alert-rule-item__icon ${item.stateModel.stateClass}`}>
                    <Icon name={item.stateModel.iconClass} size="xl" />
                  </div>
                  <div className="alert-rule-item__body">
                    <div className="alert-rule-item__header">
                      <p className="alert-rule-item__name">{item.alertName}</p>
                      <div className="alert-rule-item__text">
                        <span className={`${item.stateModel.stateClass}`}>{item.stateModel.text}</span>
                      </div>
                    </div>
                    {item.info}
                  </div>
                  <div className="alert-rule-item__time">{item.time}</div>
                </li>
              );
            })
          ) : (
            <i>No state changes recorded</i>
          )}
        </ol>
      </div>
    );
  }
}

export default StateHistory;
