import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team, isAdmin } from 'src/types';
import { getBackendSrv } from 'src/core/services/backend';
import MemberTable from './Member/MemberTable'
import AddMember from './Member/AddMember'
import { TeamMember } from 'src/types';
import appEvents from 'src/core/library/utils/app_events';
import { getState } from 'src/store/store';
import { LinkButton } from 'src/packages/datav-core/src';
import { FormattedMessage } from 'react-intl';

export interface Props {
    routeID: string;
    parentRouteID: string;
    history?: any
}

interface State {
    team: Team
    hasFetched: boolean
    members: TeamMember[]
    teamMemberOfCurrentUser: TeamMember
}

export class TeamMemberPage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            team: null,
            hasFetched: false,
            members: [],
            teamMemberOfCurrentUser: null
        }

        this.loadMembers = this.loadMembers.bind(this)
        appEvents.on('update-team-member', () => this.loadMembers())
    }
        
    componentWillMount() {
        appEvents.off('update-team-member', () => this.loadMembers)
    }

    loadMembers = async () => {
        const res =  await getBackendSrv().get(`/api/teams/members/${this.state.team.id}`)
        const members = res.data 
        members.map((member) => {
            //@ts-ignore
            member.key = member.id
        })

        this.setState({
            ...this.state,
            members,
        })
    }

    
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        // @ts-ignore
        const res = await getBackendSrv().get('/api/teams/team',{id : this.props.match.params['id']})
        const team:Team = res.data

        const res0 = await getBackendSrv().get(`/api/teams/member/${team.id}/${getState().user.id}`)

        this.setState({
            team: team,
            hasFetched: true,
            teamMemberOfCurrentUser: res0.data
        })

        this.loadMembers()
    }

    render() {
        const { routeID, parentRouteID ,history} = this.props

        const {team,hasFetched,members,teamMemberOfCurrentUser} = this.state
        let navModel;
        if (team) {
            navModel = _.cloneDeep(getNavModel(routeID,parentRouteID))
            const {node,main} = navModel
              node.url = node.url.replace(":id",team.id)
              main.children.forEach((n) => {
                  n.url = n.url.replace(":id",team.id)
              })
    
            navModel.main.title = navModel.main.title + ' / ' + team.name
        } else {
            navModel = _.cloneDeep(getNavModel(routeID,parentRouteID))
        }

        if (teamMemberOfCurrentUser) {
            navModel.main.children = navModel.main.children.filter((child) => {
                if (child.id === "team-setting" && !isAdmin(teamMemberOfCurrentUser.role)) {
                    return false
                }
                return true
            })
        }

        const teamMemberIds = {}
        if (members.length > 0) {
            members.forEach((member) => {
                teamMemberIds[member.id] = true
            })
        } 

        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    { 
                        hasFetched &&  
                        <>  
                             <LinkButton onClick={() => history.push(`/new/dashboard?fromTeam=${team.id}`)} className="ub-mr2" variant="secondary"><FormattedMessage id="dashboard.add"/></LinkButton>

                            {(isAdmin(getState().user.role) || isAdmin(teamMemberOfCurrentUser.role)) && 
                            <div style={{float: 'right'}}>
                                <AddMember teamId={team.id} inTeamMembers={teamMemberIds}/>
                            </div>}
                            <div style={{ marginTop: '10px'}} ><MemberTable teamCreatedBy={team.createdById} teamId={team.id} members={members} teamMemberOfCurrentUser={teamMemberOfCurrentUser}/></div>
                        </>
                    }
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(TeamMemberPage);
