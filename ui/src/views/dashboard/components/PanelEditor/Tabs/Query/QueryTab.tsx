// Libraries
import React, { PureComponent } from 'react';
// Components

import { QueryOptions } from './QueryOptions';
import { Button, CustomScrollbar, HorizontalGroup, Modal, stylesFactory,FormField as Field, config, getTheme, currentLang ,localeData} from 'src/packages/datav-core/src';
import { getLocationSrv } from 'src/packages/datav-core/src';
import { QueryEditorRows } from './QueryEditorRows';

// Types
import { PanelModel ,DashboardModel} from 'src/views/dashboard/model';
import {
  DataQuery,
  DataSourceSelectItem,
  DefaultTimeRange,
  LoadingState,
  PanelData,
  DataSourceApi,
} from 'src/packages/datav-core/src';



import { Unsubscribable } from 'rxjs';
import { css } from 'emotion';

import DataSourcePicker from 'src/views/components/Pickers/DataSourcePicker';
import { getDatasourceSrv } from 'src/core/services/datasource';
import { backendSrv } from 'src/core/services/backend';
import { PluginHelp } from 'src/views/cfg/plugins/PluginHelp';
import { addQuery } from 'src/core/library/utils/query';
import { notification } from 'antd';


interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
}

interface State {
  dataSource?: DataSourceApi;
  dataSourceItem: DataSourceSelectItem;
  dataSourceError?: string;
  helpContent: React.ReactNode;
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

  findCurrentDataSource(dataSourceName: string | null = this.props.panel.datasource): DataSourceSelectItem {
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

    getLocationSrv().update({
      query: { inspect: panel.id, inspectTab: 'query' },
      partial: true,
    });
  };

  renderHelp = () => {
    return;
  };

  /**
   * Sets the queries for the panel
   */
  onUpdateQueries = (queries: DataQuery[]) => {
    this.props.panel.updateQueries(queries);

    // Need to force update to rerender query rows.
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

  renderTopSection(styles: QueriesTabStyls) {
    const { panel } = this.props;
    const { dataSourceItem, data, dataSource, dataSourceError } = this.state;

    if (!dataSource) {
      return null;
    }

    return (
      <div>
        <div className={styles.dataSourceRow}>
          <div className={styles.dataSourceRowItem}>
            <Field invalid={!!dataSourceError} error={dataSourceError}>
              <DataSourcePicker
                datasources={this.datasources}
                onChange={this.onChangeDataSource}
                current={dataSourceItem}
              />
            </Field>
          </div>
          <div className={styles.dataSourceRowItem}>
            <Button
              variant="secondary"
              icon="question-circle"
              title="Open data source help"
              onClick={this.onOpenHelp}
            />
          </div>
          <div className={styles.dataSourceRowItemOptions}>
            <QueryOptions panel={panel} dataSource={dataSource} data={data} />
          </div>
          <div className={styles.dataSourceRowItem}>
            <Button
              variant="secondary"
              onClick={this.openQueryInspector}
            >
              Query inspector
            </Button>
          </div>
        </div>
      </div>
    );
  }

  onOpenHelp = () => {
    this.setState({ isHelpOpen: true });
  };

  onCloseHelp = () => {
    this.setState({ isHelpOpen: false });
  };

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
        openMenuOnFocus={true}
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
      <HorizontalGroup spacing="md" align="flex-start">
        {showAddButton && (
          <Button
            icon="plus"
            onClick={this.onAddQueryClick}
            variant="secondary"
          >
            Query
          </Button>
        )}
        {isAddingMixed && this.renderMixedPicker()}
        {config.featureToggles.expressions && (
          <Button icon="plus" onClick={this.onAddExpressionClick} variant="secondary">
            Expression
          </Button>
        )}
      </HorizontalGroup>
    );
  }

  render() {
    const { scrollTop, isHelpOpen } = this.state;
    const styles = getStyles();

    if (!this.props.panel.datasource) {
      notification['error']({
        message: "Error",
        description: localeData[currentLang]['datasource.emptyDatasources'],
        duration: 3
      });
      return null
    }

    return (
      <CustomScrollbar
        autoHeightMin="100%"
        autoHide={true}
        updateAfterMountMs={300}
        scrollTop={scrollTop}
        setScrollTop={this.setScrollTop}
      >
        <div className={styles.innerWrapper}>
          {this.renderTopSection(styles)}
          <div className={styles.queriesWrapper}>{this.renderQueries()}</div>
          {this.renderAddQueryRow()}

          {isHelpOpen && (
            <Modal title="Data source help" isOpen={true} onDismiss={this.onCloseHelp}>
              <PluginHelp plugin={this.state.dataSourceItem.meta} type="query_help" />
            </Modal>
          )}
        </div>
      </CustomScrollbar>
    );
  }
}

const getStyles = stylesFactory(() => {
  const theme  = getTheme();

  return {
    innerWrapper: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: ${theme.spacing.md};
    `,
    dataSourceRow: css`
      display: flex;
      margin-bottom: ${theme.spacing.md};
    `,
    dataSourceRowItem: css`
      margin-right: ${theme.spacing.inlineFormMargin};
    `,
    dataSourceRowItemOptions: css`
      flex-grow: 1;
      margin-right: ${theme.spacing.inlineFormMargin};
    `,
    queriesWrapper: css`
      padding-bottom: 16px;
    `,
  };
});

type QueriesTabStyls = ReturnType<typeof getStyles>;
