import React, { useState } from 'react'
// @ts-ignore
import Highlighter from 'react-highlight-words';

import { AlertHistory, Team } from 'src/types'
import { Icon, getHistory, Select ,localeData, currentLang} from 'src/packages/datav-core/src'
import classNames from 'classnames'
import { FilterInput } from '../components/FilterInput/FilterInput'
import alertDef from './state/alertDef'
import TeamPicker from '../components/Pickers/TeamPicker';
import { FormattedMessage } from 'react-intl';

interface Props {
    histories: AlertHistory[]
    enableSnapshot?: boolean
    onStateFilterChange?: any
    teams?: Team[]
    onTeamChange?: any
    showTotalTips?: boolean
}

const AlertHistoryList = (props: Props) => {
    const [search, setSearch] = useState('')
    const [stateFilter, setStateFilter] = useState('all')
    const [teamId, setTeamId] = useState(0)

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
            // const from = (history.timeUnix - 15 * 60) * 1000
            // const to = (history.timeUnix + 15 * 60) * 1000
            getHistory().push(history.dashboardUrl)
        }
    }

    const getTeamName = (teamId) => {
        if (!props.teams) {
            return undefined
        }

        let name
        for (const team of props.teams) {
            if (team.id === teamId) {
                name = team.name
            }
        }

        return name
    }

    const gotoTeam = (e, teamId) => {
        e.stopPropagation()
        getHistory().push(`/team/history/${teamId}`)
    }

    return (
        <div>
            {
                props.onStateFilterChange && <div className="page-action-bar">
                    <div className="gf-form">
                        <FilterInput
                            labelClassName="gf-form--has-input-icon gf-form--grow"
                            inputClassName="gf-form-input"
                            placeholder={localeData[currentLang]['common.search']}
                            value={search}
                            onChange={(v) => setSearch(v)}
                        />
                    </div>
                    <div className="gf-form ub-ml3">
                        <label className="gf-form-label">{localeData[currentLang]['alerting.stateFilter']}</label>

                        <div className="width-13">
                            <Select
                                options={alertDef.stateFilters}
                                onChange={(option) => { setStateFilter(option.value); props.onStateFilterChange(option) }}
                                value={stateFilter}
                            />
                        </div>
                    </div>

                    {props.teams && props.teams.length != 0 && <div className="gf-form ub-ml3">
                        <label className="gf-form-label">{localeData[currentLang]['alerting.teamFilter']}</label>

                        <div className="width-13">
                            <TeamPicker value={[teamId]} onChange={(v) => { setTeamId(v); props.onTeamChange(v) }} enableAll />
                        </div>
                    </div>}
                    <div className="page-action-bar__spacer" />
                    {/* <Button variant="secondary" onClick={this.onOpenHowTo}>
                            How to add an alert
            </Button> */}
                </div>
            }


            {props.showTotalTips && props.histories.length > 0 && (
                <div className="p-b-1">
                    <span className="muted"> <FormattedMessage id="alerting.historiesCount" values={{count: props.histories.length}}/></span>
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
                                        <span className="alert-rule-item__name">{renderText(item.alertName)} {props.teams && <a onClick={(e) => gotoTeam(e, item.teamId)} style={{textDecoration: 'underline'}}>{' (' + getTeamName(item.teamId) + ')'}</a>}</span>
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