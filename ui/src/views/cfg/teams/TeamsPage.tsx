import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv } from 'src/packages/datav-core';
import { getNavModel } from '../../Layouts/Page/navModel'
import TeamTable from './TeamTable'
import AddTeam from './AddTeam'
import { Team, isAdmin, Role } from 'src/types';
import { getState } from 'src/store/store';

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    teams: Team[]
    teamRoles: {
        number : Role
    }
    hasFetched: boolean
}

export class TeamPage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            teams: null,
            hasFetched: true,
            teamRoles: null
        }

        this.onAddTeam = this.onAddTeam.bind(this)
        this.fetchData = this.fetchData.bind(this)
    }
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        const res = await getBackendSrv().get('/api/teams')
        const res0 = await getBackendSrv().get('/api/users/user/teamRoles')
        if (res.data) {
            this.setState({
                teams: res.data,
                teamRoles: res.data,
                hasFetched: true
            })
        }
    }

    onAddTeam(team) {
        const newTeams = _.cloneDeep(this.state.teams)
        newTeams.unshift(team)
        this.setState({
            ...this.state,
            teams: newTeams
        })
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const navModel = getNavModel(routeID, parentRouteID)

        const { hasFetched, teams ,teamRoles} = this.state
        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                     <div style={{ float: 'right'}}>
                        {isAdmin(getState().user.role) && <AddTeam onAddTeam={this.onAddTeam} /> }
                    </div>
                    <div style={{ marginTop: isAdmin(getState().user.role) ? '40px' :'0' }}>
                        {hasFetched && <TeamTable teams={teams} reloadTeams={this.fetchData} teamRoles={teamRoles}/>}
                    </div>
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(TeamPage);
