import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv, Select, dateTime,dateTimeFormat} from 'src/packages/datav-core';
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
    team: Team
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
            team: null,
            search: '',
            stateFilter: 'all',
            alertHistories: []
        }

    }
    componentDidMount() {
        this.fetchTeam()
        this.fetchHistory(this.state.stateFilter)
    }

    async fetchTeam() {
        const res = await getBackendSrv().get('/api/teams/team', { id: this.teamId })
        this.setState({
            ...this.state,
            team: res.data,
            hasFetched: true
        })

    }

    async fetchHistory(stateFilter) {
        const res = await getBackendSrv().get('/api/alerting/history', {type:'team', teamId: this.teamId, stateFilter: stateFilter })
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
        this.fetchHistory(option.value)
    }
    
    render() {
        const { routeID, parentRouteID } = this.props
        const { hasFetched, team, search, stateFilter, alertHistories} = this.state

        let navModel;
        if (team) {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
            const { node, main } = navModel
            node.url = node.url.replace(":id", team.id)
            main.children.forEach((n) => {
                n.url = n.url.replace(":id", team.id)
            })

            navModel.main.title = navModel.main.title + ' / ' + team.name
        } else {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
        }

        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    <AlertHistoryList histories={alertHistories} enableSnapshot/>
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(AlertHistoryPage);
