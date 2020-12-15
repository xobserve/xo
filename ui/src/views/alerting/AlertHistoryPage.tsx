import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv, Select, dateTime,dateTimeFormat} from 'src/packages/datav-core/src';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team } from 'src/types';
import { FilterInput } from 'src/views/components/FilterInput/FilterInput';
import {AlertHistory} from 'src/types'
import AlertRuleItem from 'src/views/alerting/AlertRuleItem'
import alertDef from 'src/views/alerting/state/alertDef';
import { getTimeSrv } from 'src/core/services/time';
import AlertHistoryList from 'src/views/alerting/AlertHistoryList';

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    hasFetched: boolean
    teams: Team[]
    teamId: number
    search: string
    stateFilter: string
    alertHistories: AlertHistory[]
}

export class AlertHistoryPage extends PureComponent<Props, State> {
    teamId;
    constructor(props) {
        super(props)
        //@ts-ignore
        this.teamId = this.props.match.params['id']

        this.state = {
            hasFetched: false,
            teams: [],
            teamId: 0,
            search: '',
            stateFilter: 'all',
            alertHistories: []
        }

    }
    componentDidMount() {
        this.fetchTeam()
        this.fetchHistory(this.state.stateFilter,this.state.teamId)
    }

    async fetchTeam() {
        const res = await getBackendSrv().get('/api/teams')
        this.setState({
            ...this.state,
            teams: res.data,
            hasFetched: true
        })

    }

    async fetchHistory(stateFilter,teamId) {
        const res = await getBackendSrv().get('/api/alerting/history', {type:'team', teamId: teamId, stateFilter: stateFilter })
        const data = res.data
        const items = data.map((item: any) => {
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
            alertHistories: items
        })
    }

      
    onStateFilterChange = (option) => {
        this.setState({ ...this.state, stateFilter: option.value })
        this.fetchHistory(option.value,this.state.teamId)
    }
    
    onTeamChange = (teamId)=> {
        this.setState({
            ...this.state,
            teamId: teamId
        })

        this.fetchHistory(this.state.stateFilter, teamId)
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const { hasFetched, teams, search, stateFilter, alertHistories} = this.state

        const navModel = getNavModel(routeID,parentRouteID)

        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}> 
                    <AlertHistoryList histories={alertHistories} onStateFilterChange={this.onStateFilterChange} teams={teams} onTeamChange={this.onTeamChange} showTotalTips  enableSnapshot/>
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(AlertHistoryPage);
