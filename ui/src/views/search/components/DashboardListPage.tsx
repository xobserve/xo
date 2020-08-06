// Libraries
import React, { PureComponent } from 'react';
import _ from 'lodash'

// Components
import Page from '../../Layouts/Page/Page';
// Types
import {  NavModel } from 'src/packages/datav-core';
import { getNavModel } from '../../Layouts/Page/navModel';
import { withRouter } from 'react-router-dom';

import { FolderDTO } from 'src/types';
import { getBackendSrv } from 'src/core/services/backend';
import {ManageDashboards} from './ManageDashboards'
  

export interface Props {
  routeID: string;
  parentRouteID: string;
  navModel: NavModel;


  hasFetched: boolean;
}

interface State {
    folder?: FolderDTO
    isLoading: boolean
}

export class DatasourceListPage extends PureComponent<Props&any,State> {
  constructor(props) {
    super(props)
    this.state = {
        folder: null,
        isLoading: false
    }
  }

  async componentDidMount() {
    const uid = this.props.match.params['uid'] 
    let folder = null
    if (uid) {
        const res = await getBackendSrv().get(`/api/folder/uid/${uid}`)
        folder = res.data
    }

    this.setState({
      folder: folder,
      isLoading: true
  })
  }
  

  render() {
    if (!this.state.isLoading) {
      return null
    }
    
    const hasFetched= true
    const {routeID,parentRouteID} = this.props
    const {folder} = this.state
    let navModel;
    if (folder) {
        navModel = _.cloneDeep(getNavModel(routeID,parentRouteID))
        const {node,main} = navModel
          node.url = node.url.replace(":uid",this.props.match.params['uid'])
          main.children.forEach((n) => {
              n.url = n.url.replace(":uid",this.props.match.params['uid'])
          })

        navModel.main.title = navModel.main.title + ' / ' + folder.title
    } else {
        navModel = _.cloneDeep(getNavModel(routeID,parentRouteID))
    }

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>
          <>
            <ManageDashboards folder={folder}/>
          </>
        </Page.Contents>
      </Page>
    );
  }
}



export default withRouter(DatasourceListPage);
