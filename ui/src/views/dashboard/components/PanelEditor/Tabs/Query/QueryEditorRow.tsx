// Libraries
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
// Utils & Services



// Types
import { PanelModel ,DashboardModel} from 'src/views/dashboard/model';

import { ErrorBoundaryAlert, HorizontalGroup } from 'src/packages/datav-core/src';
import {
  DataQuery,
  DataSourceApi,
  LoadingState,
  PanelData,
  PanelEvents,
  TimeRange,
  toLegacyResponseData,
} from 'src/packages/datav-core/src';
import { QueryEditorRowTitle } from './QueryEditorRowTitle';


import { getDatasourceSrv } from 'src/core/services/datasource';
import { Emitter } from 'src/core/library/utils/emitter';
import { getTimeSrv } from 'src/core/services/time';
import { QueryOperationRow } from 'src/views/components/QueryOperationRow/QueryOperationRow';
import { QueryOperationAction } from 'src/views/components/QueryOperationRow/QueryOperationAction';

interface Props {
  panel: PanelModel;
  data: PanelData;
  query: DataQuery;
  dashboard: DashboardModel;
  dataSourceValue: string | null;
  inMixedMode?: boolean;
  id: string;
  index: number;
  onAddQuery: (query?: DataQuery) => void;
  onRemoveQuery: (query: DataQuery) => void;
  onChange: (query: DataQuery) => void;
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

  getAngularQueryComponentScope(): AngularQueryComponentScope {
    const { panel, query, dashboard } = this.props;
    const { datasource } = this.state;

    return {
      datasource: datasource,
      target: query,
      panel: panel,
      dashboard: dashboard,
      refresh: () => panel.refresh(),
      render: () => panel.render(),
      events: panel.events,
      range: getTimeSrv().timeRange(),
    };
  }

  async loadDatasource() {
    const { query, panel, dataSourceValue } = this.props;
    const dataSourceSrv = getDatasourceSrv();
    let datasource;

    try {
      const datasourceName = dataSourceValue || query.datasource || panel.datasource;
      datasource = await dataSourceSrv.get(datasourceName);
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

  onOpen = () => {
  };

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
          range={getTimeSrv().timeRange()}
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
      <HorizontalGroup width="auto">
        {hasTextEditMode && (
          <QueryOperationAction
            title="Toggle text edit mode"
            icon="pen"
            onClick={e => {
              this.onToggleEditMode(e, props);
            }}
          />
        )}
        <QueryOperationAction title="Duplicate query" icon="copy" onClick={this.onCopyQuery} />
        <QueryOperationAction
          title="Disable/enable query"
          icon={isDisabled ? 'eye-slash' : 'eye'}
          onClick={this.onDisableQuery}
        />
        <QueryOperationAction title="Remove query" icon="trash-alt" onClick={this.onRemoveQuery} />
      </HorizontalGroup>
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
        datasource={datasource!}
        disabled={isDisabled}
        onClick={e => this.onToggleEditMode(e, props)}
        collapsedText={!props.isOpen ? this.renderCollapsedText() : null}
      />
    );
  };

  render() {
    const { query, id, index } = this.props;
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
        <QueryOperationRow
          id={id}
          draggable={true}
          index={index}
          title={this.renderTitle}
          actions={this.renderActions}
          onOpen={this.onOpen}
        >
          <div className={rowClasses}>
            <ErrorBoundaryAlert>{editor}</ErrorBoundaryAlert>
          </div>
        </QueryOperationRow>
      </div>
    );
  }
}

// To avoid sending duplicate events for each row we have this global cached object here
// So we can check if we already emitted this legacy data event
let globalLastPanelDataCache: PanelData | null = null;


export interface AngularQueryComponentScope {
  target: DataQuery;
  panel: PanelModel;
  dashboard: DashboardModel;
  events: Emitter;
  refresh: () => void;
  render: () => void;
  datasource: DataSourceApi | null;
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
