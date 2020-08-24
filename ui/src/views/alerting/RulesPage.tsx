import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv } from 'src/packages/datav-core';
import { getNavModel } from 'src/views/Layouts/Page/navModel'

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    hasFetched: boolean
}

export class RulesPage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            hasFetched: true,
        }

        this.fetchData = this.fetchData.bind(this)
    }
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        const res = await getBackendSrv().get('/api/teams')
        const res0 = await getBackendSrv().get('/api/users/user/teamRoles')
        if (res.data) {
          console.log(res.data)
        }
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const navModel = getNavModel(routeID, parentRouteID)

        const { hasFetched} = this.state
        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                 
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(RulesPage);
