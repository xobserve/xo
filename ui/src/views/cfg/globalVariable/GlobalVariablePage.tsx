import React, { PureComponent } from 'react';
import { withRouter,RouteComponentProps} from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from '../../Layouts/Page/navModel'
import { initDashboard } from 'src/views/dashboard/model/initDashboard';
import { connect } from 'react-redux';
import {StoreState} from 'src/types'
import { DashboardModel } from 'src/views/dashboard/model';
export interface Props {
    routeID: string;
    parentRouteID: string;
    dashboard: DashboardModel
}

interface State {
    hasFetched: boolean
}

export class GlobalVariablePage extends PureComponent<Props & RouteComponentProps, State> {
    constructor(props) {
        super(props)
        this.state = {
            hasFetched: true,
        }

    }
    componentDidMount() {
        this.props.history.push('/d/-1')
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



export const mapStateToProps = (state: StoreState) => {
    return {
        dashboard: state.dashboard.dashboard,
    }
}

const mapDispatchToProps = {
    initDashboard,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GlobalVariablePage))


