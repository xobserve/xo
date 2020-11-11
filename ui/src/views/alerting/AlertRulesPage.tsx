import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv, dateTime} from 'src/packages/datav-core/src';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team } from 'src/types';

import {AlertRule} from 'src/types'
import alertDef from 'src/views/alerting/state/alertDef';
import AlertRuleList from 'src/views/alerting/AlertRuleList'
export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    hasFetched: boolean
    teams: Team[]
    teamId: number
    alertRules: AlertRule[]
    stateFilter: string
}

export class RulesPage extends PureComponent<Props, State> {
    teamId;
    constructor(props) {
        super(props)
        //@ts-ignore
        this.teamId = this.props.match.params['id']

        this.state = {
            hasFetched: false,
            teams: [],
            teamId: 0,
            alertRules: [],
            stateFilter: 'all'
        }

    }
    componentDidMount() {
        this.fetchTeam()
        this.fetchRules(this.state.stateFilter,this.state.teamId)
    }

    async fetchTeam() {
        const res = await getBackendSrv().get('/api/teams')
        this.setState({
            ...this.state,
            teams: res.data,
            hasFetched: true
        })
    }

    async fetchRules(stateFilter,teamId) {
        const res = await getBackendSrv().get('/api/alerting/rules', { teamId: teamId, stateFilter: stateFilter })
        this.setState({
            ...this.state,
            alertRules: res.data.map((rule:AlertRule) => this.convertToAlertRule(rule,rule.state))
        })
    }

    convertToAlertRule(dto: AlertRule, state: string): AlertRule {
        const stateModel = alertDef.getStateDisplayModel(state);
      
        const rule: AlertRule = {
          ...dto,
          stateText: stateModel.text,
          stateIcon: stateModel.iconClass,
          stateClass: stateModel.stateClass,
          stateAge: dateTime(dto.newStateDate).fromNow(true),
          url: `/d/${dto.dashboardUid}/${dto.dashboardSlug}`
        };
      
        if (rule.state !== 'paused') {
          if (rule.executionError) {
            rule.info = 'Execution Error: ' + rule.executionError;
          }
          if (rule.evalData && rule.evalData.noData) {
            rule.info = 'Query returned no data';
          }
        }
      
        return rule;
      }

      
    onStateFilterChange = (option) => {
        this.setState({
            ...this.state,
            stateFilter: option.value
        })
        this.fetchRules(option.value,this.state.teamId)
    }
    
    reloadAlerts = () => {
        this.fetchRules(this.state.stateFilter,this.state.teamId)
    }

    onTeamChange = (teamId)=> {
        this.setState({
            ...this.state,
            teamId: teamId
        })

        this.fetchRules(this.state.stateFilter, teamId)
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const { hasFetched, teams, alertRules} = this.state
        const navModel = getNavModel(routeID,parentRouteID)

        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    <AlertRuleList alertRules={alertRules} onStateFilterChange={this.onStateFilterChange} reloadAlerts={this.reloadAlerts} teams={teams} onTeamChange={this.onTeamChange}/>
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(RulesPage);
