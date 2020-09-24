import React, { useState } from 'react'
// @ts-ignore
import Highlighter from 'react-highlight-words';

import { AlertHistory } from 'src/types'
import { Icon, getHistory, Select } from 'src/packages/datav-core/src'
import classNames from 'classnames'
import { FilterInput } from '../components/FilterInput/FilterInput'
import alertDef from './state/alertDef'

interface Props {
    histories: AlertHistory[]
    enableSnapshot?: boolean
    onStateFilterChange?: any
}

const AlertHistoryList = (props: Props) => {
    const [search, setSearch] = useState('')
    const [stateFilter, setStateFilter] = useState('all')

    const renderText = (text: string) => {
        return (
          <Highlighter
            highlightClassName="highlight-search-match"
            textToHighlight={text}
            searchWords={[search]}
          />
        );
      }

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
            {
                props.onStateFilterChange && <div className="page-action-bar">
                    <div className="gf-form gf-form--grow">
                        <FilterInput
                            labelClassName="gf-form--has-input-icon gf-form--grow"
                            inputClassName="gf-form-input"
                            placeholder="Search alerts"
                            value={search}
                            onChange={(v) => setSearch(v)}
                        />
                    </div>
                    <div className="gf-form">
                        <label className="gf-form-label">State filter</label>

                        <div className="width-13">
                            <Select
                                options={alertDef.stateFilters}
                                onChange={(option) => { setStateFilter(option.value); props.onStateFilterChange(option) }}
                                value={stateFilter}
                            />
                        </div>
                    </div>
                    <div className="page-action-bar__spacer" />
                    {/* <Button variant="secondary" onClick={this.onOpenHowTo}>
                            How to add an alert
            </Button> */}
                </div>
            }


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
                                        <p className="alert-rule-item__name">{renderText(item.alertName)}</p>
                                        <div className="alert-rule-item__text">
                                            <span className={`${item.stateModel.stateClass}`}>{item.stateModel.text}</span>
                                        </div>
                                    </div>
                                    {renderText(item.info)}
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