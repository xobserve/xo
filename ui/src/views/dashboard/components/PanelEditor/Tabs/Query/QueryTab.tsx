// Libraries
import React, { PureComponent } from 'react';
// Components
import { DataSourcePicker } from 'src/views/components/Pickers/DataSourcePicker';
import { QueryOptions } from './QueryOptions'
import { CustomScrollbar, FormField as Field } from 'src/packages/datav-core/src';
import {Row,Button,notification} from 'antd'
import { QueryEditorRows } from './QueryEditorRows';
// Services
import { getDatasourceSrv } from 'src/core/services/datasource';
import { backendSrv } from 'src/core/services/backend';
// Types
import { DashboardModel,PanelModel } from '../../../../model';
import {
  DataQuery,
  DataSourceSelectItem,
  DefaultTimeRange,
  LoadingState,
  PanelData,
  DataSourceApi,
  config
} from 'src/packages/datav-core/src';
import { addQuery } from 'src/core/library/utils/query';
import { Unsubscribable } from 'rxjs';
import { PlusOutlined } from '@ant-design/icons';
import { addParamToUrl } from 'src/core/library/utils/url';
import './QueryTab.less'
import { FormattedMessage } from 'react-intl';

interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
}

interface State {
  dataSource?: DataSourceApi;
  dataSourceItem: DataSourceSelectItem;
  dataSourceError?: string;
  helpContent: JSX.Element;
  isLoadingHelp: boolean;
  isPickerOpen: boolean;
  isAddingMixed: boolean;
  scrollTop: number;
  data: PanelData;
  isHelpOpen: boolean;
}

export class QueriesTab extends PureComponent<Props, State> {
  datasources: DataSourceSelectItem[] = getDatasourceSrv().getMetricSources();
  backendSrv = backendSrv;
  querySubscription: Unsubscribable | null;

  state: State = {
    isLoadingHelp: false,
    dataSourceItem: this.findCurrentDataSource(),
    helpContent: null,
    isPickerOpen: false,
    isAddingMixed: false,
    isHelpOpen: false,
    scrollTop: 0,
    data: {
      state: LoadingState.NotStarted,
      series: [],
      timeRange: DefaultTimeRange,
    },
  };

  async componentDidMount() {
    const { panel } = this.props;
    const queryRunner = panel.getQueryRunner();

    this.querySubscription = queryRunner.getData({ withTransforms: false, withFieldConfig: false }).subscribe({
      next: (data: PanelData) => this.onPanelDataUpdate(data),
    });

    try {
      const ds = await getDatasourceSrv().get(panel.datasource);
      this.setState({ dataSource: ds });
    } catch (error) {
      notification['error']({
        message: "Error",
        description: error.message,
        duration: 5
      });
      const ds = await getDatasourceSrv().get();
      const dataSourceItem = this.findCurrentDataSource(ds.name);
      this.setState({ dataSource: ds, dataSourceError: error?.message, dataSourceItem });
    }
  }

  componentWillUnmount() {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
      this.querySubscription = null;
    }
  }

  onPanelDataUpdate(data: PanelData) {
    this.setState({ data });
  }

  findCurrentDataSource(dataSourceName: string = this.props.panel.datasource): DataSourceSelectItem {
    return this.datasources.find(datasource => datasource.value === dataSourceName) || this.datasources[0];
  }

  onChangeDataSource = async (newDsItem: DataSourceSelectItem) => {
    const { panel } = this.props;
    const { dataSourceItem } = this.state;


   if (dataSourceItem) {
      if (dataSourceItem.meta.id !== newDsItem.meta.id) {
        // we are changing data source type, clear queries
        panel.targets = [{ refId: 'A' }];
      }
    }

    const dataSource = await getDatasourceSrv().get(newDsItem.value);
    panel.datasource = newDsItem.value;

    this.setState(
      {
        dataSourceItem: newDsItem,
        dataSource: dataSource,
        dataSourceError: undefined,
      },
      () => panel.refresh()
    );
  };

  openQueryInspector = () => {
    const { panel } = this.props;

    addParamToUrl({ inspect: panel.id, inspectTab: 'query' })
  };

  renderHelp = () => {
    return;
  };

  /**
   * Sets the queries for the panel
   */
  onUpdateQueries = (queries: DataQuery[]) => {
    this.props.panel.targets = queries;
    this.forceUpdate();
  };

  onAddQueryClick = () => {
    if (this.state.dataSourceItem.meta.mixed) {
      this.setState({ isAddingMixed: true });
      return;
    }

    this.onUpdateQueries(addQuery(this.props.panel.targets));
    this.onScrollBottom();
  };

  onAddExpressionClick = () => {
    // this.onUpdateQueries(addQuery(this.props.panel.targets, expressionDatasource.newQuery()));
    // this.onScrollBottom();
  };

  onScrollBottom = () => {
    this.setState({ scrollTop: 1000 });
  };

  renderTopSection() {
    const { panel } = this.props;
    const { dataSourceItem, data, dataSource, dataSourceError } = this.state;

    if (!dataSource) {
      return null;
    }

    return (
      <div>
        <div className={'dataSourceRow'}>
          <div className={'dataSourceRowItem'}>
            <Field invalid={!!dataSourceError} error={dataSourceError}>
              <DataSourcePicker
                datasources={this.datasources}
                onChange={this.onChangeDataSource}
                current={dataSourceItem}
              />
            </Field>
          </div>
          <div className={'dataSourceRowItemOptions'}>
            <QueryOptions panel={panel} dataSource={dataSource} data={data} />
          </div>
          <div className={'dataSourceRowItem'}>
            <Button
              onClick={this.openQueryInspector}
            >
               <FormattedMessage id="panel.queryInspect"/>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  renderMixedPicker = () => {
    // We cannot filter on mixed flag as some mixed data sources like external plugin
    // meta queries data source is mixed but also supports it's own queries
    const filteredDsList = this.datasources.filter(ds => ds.meta.id !== 'mixed');

    return (
      <DataSourcePicker
        datasources={filteredDsList}
        onChange={this.onAddMixedQuery}
        current={null}
        autoFocus={true}
        onBlur={this.onMixedPickerBlur}
      />
    );
  };

  onAddMixedQuery = (datasource: any) => {
    this.props.panel.targets = addQuery(this.props.panel.targets, { datasource: datasource.name });
    this.setState({ isAddingMixed: false, scrollTop: this.state.scrollTop + 10000 });
    this.forceUpdate();
  };

  onMixedPickerBlur = () => {
    this.setState({ isAddingMixed: false });
  };

  onQueryChange = (query: DataQuery, index: number) => {
    this.props.panel.changeQuery(query, index);
    this.forceUpdate();
  };

  setScrollTop = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    this.setState({ scrollTop: target.scrollTop });
  };

  renderQueries() {
    const { panel, dashboard } = this.props;
    const { dataSourceItem, data } = this.state;
    
    return (
      <div>
        <QueryEditorRows
          queries={panel.targets}
          datasource={dataSourceItem}
          onChangeQueries={this.onUpdateQueries}
          onScrollBottom={this.onScrollBottom}
          panel={panel}
          dashboard={dashboard}
          data={data}
        />
      </div>
    );
  }

  renderAddQueryRow() {
    const { dataSourceItem, isAddingMixed } = this.state;
    const showAddButton = !(isAddingMixed);

    return (
      <Row>
        {showAddButton && (
          <Button
            icon= {<PlusOutlined />}
            onClick={this.onAddQueryClick}
          >
            <FormattedMessage id="common.query"/>
          </Button>
        )}
        {isAddingMixed && this.renderMixedPicker()}
        {config.featureToggles.expressions && (
          <Button icon= {<PlusOutlined />} onClick={this.onAddExpressionClick}>
            <FormattedMessage id="common.expression"/>
          </Button>
        )}
      </Row>
    );
  }

  render() {
    const { scrollTop, isHelpOpen } = this.state;
    return (
      <CustomScrollbar
        autoHeightMin="100%"
        autoHide={true}
        updateAfterMountMs={300}
        scrollTop={scrollTop}
        setScrollTop={this.setScrollTop}
      >
        <div className={'query-tab-innerWrapper '}>
          {this.renderTopSection()}
          <div className={'queriesWrapper'}>{this.renderQueries()}</div>
          {this.renderAddQueryRow()}
        </div>
      </CustomScrollbar>
    );
  }
}

