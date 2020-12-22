import React, { PureComponent } from 'react';
import { Button, getTheme, JSONFormatter, LoadingPlaceholder } from 'src/packages/datav-core/src';
import { AppEvents, PanelEvents, DataFrame } from 'src/packages/datav-core/src';


import { CopyToClipboard } from 'src/views/components/CopyToClipboard/CopyToClipboard';
import { PanelModel } from 'src/views/dashboard/model';
import { getPanelInspectorStyles } from './styles';


import { css } from 'emotion';
import { Unsubscribable } from 'rxjs';

import appEvents from 'src/core/library/utils/app_events';
import { backendSrv } from 'src/core/services/backend';
import { supportsDataQuery } from 'src/views/dashboard/components/PanelEditor/utils';
import { CoreEvents } from 'src/types';

interface DsQuery {
  isLoading: boolean;
  response: {};
}

interface ExecutedQueryInfo {
  refId: string;
  query: string;
  frames: number;
  rows: number;
}

interface Props {
  panel: PanelModel;
  data: DataFrame[];
}

interface State {
  allNodesExpanded: boolean | null;
  isMocking: boolean;
  mockedResponse: string;
  dsQuery: DsQuery;
  executedQueries: ExecutedQueryInfo[];
}

export class QueryInspector extends PureComponent<Props, State> {
  formattedJson: any;
  clipboard: any;
  subscription?: Unsubscribable;

  constructor(props: Props) {
    super(props);
    this.state = {
      executedQueries: [],
      allNodesExpanded: null,
      isMocking: false,
      mockedResponse: '',
      dsQuery: {
        isLoading: false,
        response: {},
      },
    };
  }

  componentDidMount() {
    appEvents.on(CoreEvents.dsRequestResponse, (res) => this.onDataSourceResponse(res.data));

    this.props.panel.events.on(PanelEvents.refresh, this.onPanelRefresh);
    this.updateQueryList();
  }

  componentDidUpdate(oldProps: Props) {
    if (this.props.data !== oldProps.data) {
      this.updateQueryList();
    }
  }

  /**
   * Find the list of executed queries
   */
  updateQueryList() {
    const { data } = this.props;
    const executedQueries: ExecutedQueryInfo[] = [];

    if (data?.length) {
      let last: ExecutedQueryInfo | undefined = undefined;

      data.forEach((frame, idx) => {
        const query = frame.meta?.executedQueryString;

        if (query) {
          const refId = frame.refId || '?';

          if (last?.refId === refId) {
            last.frames++;
            last.rows += frame.length;
          } else {
            last = {
              refId,
              frames: 0,
              rows: frame.length,
              query,
            };
            executedQueries.push(last);
          }
        }
      });
    }

    this.setState({ executedQueries });
  }

  onIssueNewQuery = () => {
    this.props.panel.refresh();
  };

  componentWillUnmount() {
    const { panel } = this.props;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    panel.events.off(PanelEvents.refresh, this.onPanelRefresh);
  }

  onPanelRefresh = () => {
    this.setState(prevState => ({
      ...prevState,
      dsQuery: {
        isLoading: true,
        response: {},
      },
    }));
  };

  onDataSourceResponse(response: any) {
    console.log(response)
    // ignore silent requests
    if (response.config?.hideFromInspector) {
      return;
    }

    response = { ...response }; // clone - dont modify the response

    if (response.headers) {
      delete response.headers;
    }

    if (response.config) {
      response.request = response.config;

      delete response.config;
      delete response.request.transformRequest;
      delete response.request.transformResponse;
      delete response.request.paramSerializer;
      delete response.request.jsonpCallbackParam;
      delete response.request.headers;
      delete response.request.requestId;
      delete response.request.inspect;
      delete response.request.retry;
      delete response.request.timeout;
    }

    if (response.data) {
      response.response = response.data;

      delete response.config;
      delete response.data;
      delete response.status;
      delete response.statusText;
      delete response.ok;
      delete response.url;
      delete response.redirected;
      delete response.type;
      delete response.$$config;
    }

    this.setState(prevState => ({
      ...prevState,
      dsQuery: {
        isLoading: false,
        response: response,
      },
    }));
  }

  setFormattedJson = (formattedJson: any) => {
    this.formattedJson = formattedJson;
  };

  getTextForClipboard = () => {
    return JSON.stringify(this.formattedJson, null, 2);
  };

  onClipboardSuccess = () => {
    appEvents.emit(AppEvents.alertSuccess, ['Content copied to clipboard']);
  };

  onToggleExpand = () => {
    this.setState(prevState => ({
      ...prevState,
      allNodesExpanded: !this.state.allNodesExpanded,
    }));
  };

  onToggleMocking = () => {
    this.setState(prevState => ({
      ...prevState,
      isMocking: !this.state.isMocking,
    }));
  };

  getNrOfOpenNodes = () => {
    if (this.state.allNodesExpanded === null) {
      return 3; // 3 is default, ie when state is null
    } else if (this.state.allNodesExpanded) {
      return 20;
    }
    return 1;
  };

  setMockedResponse = (evt: any) => {
    const mockedResponse = evt.target.value;
    this.setState(prevState => ({
      ...prevState,
      mockedResponse,
    }));
  };

  renderExecutedQueries(executedQueries: ExecutedQueryInfo[]) {
    if (!executedQueries.length) {
      return null;
    }

    const styles = {
      refId: css`
        font-weight: ${getTheme().typography.weight.semibold};
        color: ${getTheme().colors.textBlue};
        margin-right: 8px;
      `,
    };

    return (
      <div>
        {executedQueries.map(info => {
          return (
            <div key={info.refId}>
              <div>
                <span className={styles.refId}>{info.refId}:</span>
                {info.frames > 1 && <span>{info.frames} frames, </span>}
                <span>{info.rows} rows</span>
              </div>
              <pre>{info.query}</pre>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { allNodesExpanded, executedQueries } = this.state;
    const { response, isLoading } = this.state.dsQuery;
    const openNodes = this.getNrOfOpenNodes();
    const styles = getPanelInspectorStyles();
    const haveData = Object.keys(response).length > 0;

    if (!supportsDataQuery(this.props.panel.plugin)) {
      return null;
    }

    return (
      <>
        <div>
          <h3 className="section-heading">Query inspector</h3>
          <p className="small muted">
            Query inspector allows you to view raw request and response. To collect this data Grafana needs to issue a
            new query. Hit refresh button below to trigger a new query.
          </p>
        </div>
        {this.renderExecutedQueries(executedQueries)}
        <div className={styles.toolbar}>
          <Button
            icon="sync"
            onClick={this.onIssueNewQuery}
          >
            Refresh
          </Button>

          {haveData && allNodesExpanded && (
            <Button icon="minus" variant="secondary" className={styles.toolbarItem} onClick={this.onToggleExpand}>
              Collapse all
            </Button>
          )}
          {haveData && !allNodesExpanded && (
            <Button icon="plus" variant="secondary" className={styles.toolbarItem} onClick={this.onToggleExpand}>
              Expand all
            </Button>
          )}

          {haveData && (
            <CopyToClipboard
              text={this.getTextForClipboard}
              onSuccess={this.onClipboardSuccess}
              elType="div"
              className={styles.toolbarItem}
            >
              <Button icon="copy" variant="secondary">
                Copy to clipboard
              </Button>
            </CopyToClipboard>
          )}
          <div className="flex-grow-1" />
        </div>
        <div className={styles.contentQueryInspector}>
          {isLoading && <LoadingPlaceholder text="Loading query inspector..." />}
          {!isLoading && haveData && (
            <JSONFormatter json={response} open={openNodes} onDidRender={this.setFormattedJson} />
          )}
          {!isLoading && !haveData && <p className="muted">No request & response collected yet. Hit refresh button</p>}
        </div>
      </>
    );
  }
}
