import React from 'react'
import {AlertHistory} from 'src/types'
import { Icon, getHistory } from 'src/packages/datav-core/src'
import classNames from 'classnames'

interface Props {
    histories : AlertHistory[]
    enableSnapshot?: boolean
}

const AlertHistoryList = (props: Props) => {
    const gotoSnapshot = (history: AlertHistory) => {
        if (props.enableSnapshot) {
            // snapshot timerange is [current -15m, current + 15m]
            const from = (history.timeUnix - 15 * 60) * 1000
            const to = (history.timeUnix + 15 * 60) * 1000
            getHistory().push(history.dashboardUrl + '?from=' + from + '&to=' + to + '&viewPanel=' + history.panelId)
        }
    }

    return (
        <div>
            {props.histories.length > 0 && (
                <div className="p-b-1">
                    <span className="muted">Last 50 alert history</span>
                </div>
            )}
            <ol className="alert-rule-list ub-mt2">
                {props.histories.length > 0 ? (
                    props.histories.map((item, index) => {
                        const itemClass = classNames('alert-rule-item', { pointer: props.enableSnapshot });
                        return (
                            <li className={itemClass} key={`${item.time}-${index}`} onClick={() => gotoSnapshot(item)}>
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
    )
}


export default AlertHistoryList;