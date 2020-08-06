import React, { PureComponent } from 'react';
import {withRouter} from 'react-router-dom'

import Page from 'src/views/Layouts/Page/Page';
import {PluginMeta, getBackendSrv } from 'src/packages/datav-core';
import PluginList from './PluginList';
import {getNavModel} from '../../Layouts/Page/navModel'
import './Plugins.less'

export interface Props { 
  routeID: string;
  parentRouteID: string;
}

interface State {
    plugins: PluginMeta[];
    hasFetched: boolean;
    searchQuery: string;
}

export class PluginListPage extends PureComponent<Props,State> {
  constructor(props) {
    super(props)
    this.state = {
        plugins: null,
        hasFetched: false,
        searchQuery: null
    }
  }
  componentDidMount() {
    this.fetchPlugins();
  }

  async fetchPlugins() {
    const result =  await getBackendSrv().get('/api/plugins')
    if (result.data) {
        this.setState({
            ...this.state,
            plugins: result.data,
            hasFetched: true
        })
    }
  }

  render() {
    const {routeID,parentRouteID} = this.props
    const navModel = getNavModel(routeID,parentRouteID)
    const {hasFetched,plugins} = this.state

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>
          <>
            {hasFetched && <PluginList plugins={plugins} />}
          </>
        </Page.Contents>
      </Page>
    );
  }
}




export default withRouter(PluginListPage);
