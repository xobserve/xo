// Libraries
import React, { PureComponent } from 'react';

// Components
import Page from '../../Layouts/Page/Page';
import DataSourceList from './DataSourceList'
// Types
import { DataSourceSettings, NavModel, getBackendSrv,config} from 'src/packages/datav-core/src';
import {IconName, LinkButton} from 'src/packages/datav-core/src/ui';
import EmptyListCTA from 'src/views/components/EmptyListCTA/EmptyListCTA'
import { getNavModel } from '../../Layouts/Page/navModel';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { getState } from 'src/store/store';
import { Langs } from 'src/core/library/locale/types';




const emptyEnListModel = {
  title: 'There are no data sources defined yet',
  buttonIcon: 'database' as IconName,
  buttonLink: '/datasources/new',
  buttonTitle: 'Add data source',
  proTip: 'You can also define data sources through configuration files.',
  proTipLink: `${config.officialWebsite}/docs/administration/provisioning/#datasources?utm_source=grafana_ds_list`,
  proTipLinkTitle: 'Learn more',
  proTipTarget: '_blank',
};

const emptyCnListModel = {
  title: '当前还未创建任何数据源',
  buttonIcon: 'database' as IconName,
  buttonLink: '/datasources/new',
  buttonTitle: '新建数据源',
  proTip: '你还可以通过配置文件来定义数据源',
  proTipLink: `${config.officialWebsite}docs/administration/provisioning/#datasources?utm_source=grafana_ds_list`,
  proTipLinkTitle: '查看更多',
  proTipTarget: '_blank',
};



export interface Props {
  routeID: string;
  parentRouteID: string;
  navModel: NavModel;

  searchQuery: string;
  hasFetched: boolean;
}

interface State {
  dataSources: DataSourceSettings[]
}

export class DatasourceListPage extends PureComponent<Props&any,State> {
  constructor(props) {
    super(props)
    this.state = {
      dataSources: []
    }
  }
  componentDidMount() {
    this.fetchDataSources();
  }
  
  async fetchDataSources() {
     const res = await getBackendSrv().get('/api/datasources')
     this.setState({
       ...this.state,
       dataSources: res.data
     })
  }

  render() {
    const {
      history
    } = this.props;
    const hasFetched= true
    const {routeID,parentRouteID} = this.props
    const navModel = getNavModel(routeID,parentRouteID)
    const dataSourses = this.state.dataSources

    const gotoUrl = () => {
      history.push('/datasources/new')
    }

    let emptyModel = emptyEnListModel
    if (getState().application.locale === Langs.Chinese) {
      emptyModel = emptyCnListModel
    }
    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>
          <>
            {hasFetched && dataSourses.length !== 0  &&  <div className="ub-right"><LinkButton onClick={() => gotoUrl()}><FormattedMessage id="datasource.add" /></LinkButton></div>}
            <div style={{marginTop: '40px'}}>
            {hasFetched && dataSourses.length === 0 && <EmptyListCTA {...emptyModel} />}
            {hasFetched &&
              dataSourses.length > 0 &&
                <DataSourceList dataSources={dataSourses} key="list" />}
            </div>
          </>
        </Page.Contents>
      </Page>
    );
  }
}



export default withRouter(DatasourceListPage);
