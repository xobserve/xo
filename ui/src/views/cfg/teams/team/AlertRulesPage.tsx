import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv, dateTime} from 'src/packages/datav-core';
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
    team: Team
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
            team: null,
            alertRules: [],
            stateFilter: 'all'
        }

    }
    componentDidMount() {
        this.fetchTeam()
        this.fetchRules(this.state.stateFilter)
    }

    async fetchTeam() {
        const res = await getBackendSrv().get('/api/teams/team', { id: this.teamId })
        this.setState({
            ...this.state,
            team: res.data,
            hasFetched: true
        })

    }

    async fetchRules(stateFilter) {
        const res = await getBackendSrv().get('/api/alerting/rules', { teamId: this.teamId, stateFilter: stateFilter })
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
        this.fetchRules(option.value)
    }
    
    reloadAlerts = () => {
        this.fetchRules(this.state.stateFilter)
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const { hasFetched, team, alertRules} = this.state

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
                    <AlertRuleList alertRules={alertRules} onStateFilterChange={this.onStateFilterChange} reloadAlerts={this.reloadAlerts}/>
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(RulesPage);
