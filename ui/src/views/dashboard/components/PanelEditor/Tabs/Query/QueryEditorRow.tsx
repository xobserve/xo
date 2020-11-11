// Libraries
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
// Utils & Services

import { Emitter } from 'src/core/library/utils/emitter';
import {Row} from 'antd'

// Types
import { PanelModel,DashboardModel} from '../../../../model';


import {
  DataQuery,
  DataSourceApi,
  LoadingState,
  PanelData,
  PanelEvents,
  TimeRange,
  toLegacyResponseData,
  ErrorBoundaryAlert
} from 'src/packages/datav-core/src';
import { QueryEditorRowTitle } from './QueryEditorRowTitle';
import { QueryOperationRow } from 'src/views/components/QueryOperationRow/QueryOperationRow';
import { QueryOperationAction } from 'src/views/components/QueryOperationRow/QueryOperationAction';


import { getDatasourceSrv } from 'src/core/services/datasource';
import { getTimeSrv } from 'src/core/services/time';
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store';

interface Props {
  panel: PanelModel;
  data: PanelData;
  query: DataQuery;
  dashboard: DashboardModel;
  onAddQuery: (query?: DataQuery) => void;
  onRemoveQuery: (query: DataQuery) => void;
  onMoveQuery: (query: DataQuery, direction: number) => void;
  onChange: (query: DataQuery) => void;
  dataSourceValue: string | null;
  inMixedMode: boolean;
}

interface State {
  loadedDataSourceValue: string | null | undefined;
  datasource: DataSourceApi | null;
  hasTextEditMode: boolean;
  data?: PanelData;
  isOpen?: boolean;
}

export class QueryEditorRow extends PureComponent<Props, State> {
  element: HTMLElement | null = null;

  state: State = {
    datasource: null,
    loadedDataSourceValue: undefined,
    hasTextEditMode: false,
    data: undefined,
    isOpen: true,
  };

  componentDidMount() {
    this.loadDatasource();
  }

  componentWillUnmount() {
  }

  async loadDatasource() {
    const { query, panel } = this.props;
    const dataSourceSrv = getDatasourceSrv();
    let datasource;

    try {
      datasource = await dataSourceSrv.get(query.datasource || panel.datasource);
    } catch (error) {
      datasource = await dataSourceSrv.get();
    }

    this.setState({
      datasource,
      loadedDataSourceValue: this.props.dataSourceValue,
      hasTextEditMode: _.has(datasource, 'components.QueryCtrl.prototype.toggleEditorMode'),
    });
  }

  componentDidUpdate(prevProps: Props) {
    const { loadedDataSourceValue } = this.state;
    const { data, query, panel } = this.props;

    if (data !== prevProps.data) {
      this.setState({ data: filterPanelDataToQuery(data, query.refId) });
    }

    // check if we need to load another datasource
    if (loadedDataSourceValue !== this.props.dataSourceValue) {
      this.loadDatasource();
      return;
    }

    if (!this.element) {
      return;
    }
  }


  onRunQuery = () => {
    this.props.panel.refresh();
  };

  renderPluginEditor = () => {
    const { query, onChange } = this.props;
    const { datasource, data } = this.state;

    if (datasource?.components?.QueryCtrl) {
      return <div ref={element => (this.element = element)} />;
    }

    if (datasource?.components?.QueryEditor) {
      const QueryEditor = datasource.components.QueryEditor;
      return (
        <QueryEditor
          key={datasource?.name}
          query={query}
          datasource={datasource}
          onChange={onChange}
          onRunQuery={this.onRunQuery}
          data={data}
        />
      );
    }

    return <div>Data source plugin does not export any Query Editor component</div>;
  };

  onToggleEditMode = (e: React.MouseEvent, { isOpen, openRow }: { isOpen: boolean; openRow: () => void }) => {
    e.stopPropagation();
  };

  onRemoveQuery = () => {
    this.props.onRemoveQuery(this.props.query);
  };

  onCopyQuery = () => {
    const copy = _.cloneDeep(this.props.query);
    this.props.onAddQuery(copy);
  };

  onDisableQuery = () => {
    this.props.query.hide = !this.props.query.hide;
    this.onRunQuery();
    this.forceUpdate();
  };

  renderCollapsedText(): string | null {
    const { datasource } = this.state;
    if (datasource?.getQueryDisplayText) {
      return datasource.getQueryDisplayText(this.props.query);
    }

    return null;
  }

  renderActions = (props: { isOpen: boolean; openRow: () => void }) => {
    const { query } = this.props;
    const { hasTextEditMode } = this.state;
    const isDisabled = query.hide;

    return (
      <Row align="middle">
        {hasTextEditMode && (
          <QueryOperationAction
            title={localeData[getState().application.locale]['panel.toggleMode']}
            icon="pen"
            onClick={e => {
              this.onToggleEditMode(e, props);
            }}
          />
        )}
        <QueryOperationAction
          title={localeData[getState().application.locale]['panel.moveQueryDown']}
          icon="arrow-down"
          onClick={() => this.props.onMoveQuery(query, 1)}
        />
        <QueryOperationAction title={localeData[getState().application.locale]['panel.moveQueryUp']} icon="arrow-up" onClick={() => this.props.onMoveQuery(query, -1)} />

        <QueryOperationAction title={localeData[getState().application.locale]['panel.duplicateQueyr']} icon="copy" onClick={this.onCopyQuery} />
        <QueryOperationAction
          title={localeData[getState().application.locale]['panel.toggleQuery']}
          icon={isDisabled ? 'eye-slash' : 'eye'}
          onClick={this.onDisableQuery}
        />
        <QueryOperationAction title={localeData[getState().application.locale]['panel.removeQuery']} icon="trash-alt" onClick={this.onRemoveQuery} />
      </Row>
    );
  };

  renderTitle = (props: { isOpen: boolean; openRow: () => void }) => {
    const { query, inMixedMode } = this.props;
    const { datasource } = this.state;
    const isDisabled = query.hide;
    return (
      <QueryEditorRowTitle
        query={query}
        inMixedMode={inMixedMode}
        datasource={datasource}
        disabled={isDisabled}
        onClick={e => this.onToggleEditMode(e, props)}
        collapsedText={!props.isOpen ? this.renderCollapsedText() : null}
      />
    );
  };

  render() {
    const { query } = this.props;
    const { datasource } = this.state;
    const isDisabled = query.hide;

    const rowClasses = classNames('query-editor-row', {
      'query-editor-row--disabled': isDisabled,
      'gf-form-disabled': isDisabled,
    });

    if (!datasource) {
      return null;
    }

    const editor = this.renderPluginEditor();

    return (
      <div>
        <QueryOperationRow title={this.renderTitle} actions={this.renderActions}>
          <div className={rowClasses}>
            <ErrorBoundaryAlert>{editor}</ErrorBoundaryAlert>
          </div>
        </QueryOperationRow>
      </div>
    );
  }
}


export interface AngularQueryComponentScope {
  target: DataQuery;
  panel: PanelModel;
  dashboard: DashboardModel;
  events: Emitter;
  refresh: () => void;
  render: () => void;
  datasource: DataSourceApi;
  toggleEditorMode?: () => void;
  getCollapsedText?: () => string;
  range: TimeRange;
}

/**
 * Get a version of the PanelData limited to the query we are looking at
 */
export function filterPanelDataToQuery(data: PanelData, refId: string): PanelData | undefined {
  const series = data.series.filter(series => series.refId === refId);

  // No matching series
  if (!series.length) {
    // If there was an error with no data, pass it to the QueryEditors
    if (data.error && !data.series.length) {
      return {
        ...data,
        state: LoadingState.Error,
      };
    }
    return undefined;
  }

  // Only say this is an error if the error links to the query
  let state = LoadingState.Done;
  const error = data.error && data.error.refId === refId ? data.error : undefined;
  if (error) {
    state = LoadingState.Error;
  }

  const timeRange = data.timeRange;

  return {
    ...data,
    state,
    series,
    error,
    timeRange,
  };
}
