import React, { useState } from 'react'

import { FilterInput } from 'src/views/components/FilterInput/FilterInput';
import { AlertRule } from 'src/types'
import AlertRuleItem from 'src/views/alerting/AlertRuleItem'
import alertDef from 'src/views/alerting/state/alertDef';
import { Select, getBackendSrv } from 'src/packages/datav-core'
interface Props {
    alertRules: AlertRule[]
    onStateFilterChange: any
    reloadAlerts: any
}

const AlertRuleList = (props: Props) => {
    const [search, setSearch] = useState('')
    const [stateFilter, setStateFilter] = useState('all')
    const onTogglePause = async (rule: AlertRule) => {
        await getBackendSrv().post(`/api/alerting/pause`,{alertId: rule.id,paused: rule.state !== 'paused'})
        props.reloadAlerts()
    }
    return (
        <>
            <div className="page-action-bar">
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
                            onChange={(option) => { setStateFilter(option.value); props.onStateFilterChange() }}
                            value={stateFilter}
                        />
                    </div>
                </div>
                <div className="page-action-bar__spacer" />
                {/* <Button variant="secondary" onClick={this.onOpenHowTo}>
                            How to add an alert
            </Button> */}
            </div>

            <section>
                <ol className="alert-rule-list">
                    {props.alertRules.map(rule => (
                        <AlertRuleItem
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