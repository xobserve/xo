import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv } from 'src/packages/datav-core';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team } from 'src/types';

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    hasFetched: boolean
    team: Team
}

export class RulesPage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            hasFetched: false,
            team: null
        }

        this.fetchData = this.fetchData.bind(this)
    }
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
       //@ts-ignore
       const res = await getBackendSrv().get('/api/teams/team', { id: this.props.match.params['id'] })
       this.setState({
           ...this.state,
           team: res.data,
           hasFetched: true
       })
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const { hasFetched,team} = this.state
        
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
        
        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                 
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(RulesPage);
