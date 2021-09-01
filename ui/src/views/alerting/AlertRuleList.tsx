import React, { useState } from 'react'

import { FilterInput } from 'src/views/components/FilterInput/FilterInput';
import { AlertRule, Team} from 'src/types'
import AlertRuleItem from 'src/views/alerting/AlertRuleItem'
import alertDef from 'src/views/alerting/state/alertDef';
import {  getBackendSrv, localeData, currentLang } from 'src/packages/datav-core/src'
import {Select} from 'src/packages/datav-core/src/ui'
import TeamPicker from '../components/Pickers/TeamPicker';

interface Props {
    alertRules: AlertRule[]
    onStateFilterChange: any
    reloadAlerts: any
    teams?: Team[]
    onTeamChange?: any
}

const AlertRuleList = (props: Props) => {
    const [search, setSearch] = useState('')
    const [stateFilter, setStateFilter] = useState('all')
    const [teamId, setTeamId] = useState(0)

    const onTogglePause = async (rule: AlertRule) => {
        await getBackendSrv().post(`/api/alerting/pause`,{alertId: rule.id,paused: rule.state !== 'paused'})
        props.reloadAlerts()
    }

    const getTeam = (teamId) => {
        let team
        if (!props.teams) {
            return team
        }

        for (const t of props.teams) {
            if (t.id === teamId) {
                team = t
            }
        }

        return team
    }

    return (
        <>
            <div className="page-action-bar">
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

            <section>
                <ol className="alert-rule-list">
                    {props.alertRules.map(rule => (
                        <AlertRuleItem
                            team={getTeam(rule.teamId)}
                            rule={rule}
                            key={rule.id}
                            search={search}
                            onTogglePause={() => onTogglePause(rule)}
                        />
                    ))}
                </ol>
            </section>
        </>
    )
}


export default AlertRuleList;