// Libraries
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Unsubscribable } from 'rxjs';

// Utils & Services
import { getTimeSrv, TimeSrv } from 'src/core/services/time';

// Types
import { PanelModel } from './model/PanelModel';
import { DashboardModel } from './model/DashboardModel';
import { PANEL_BORDER } from 'src/core/constants';
import { PanelHeader } from './components/PanelHeader/PanelHeader'
 
import {
  LoadingState,
  AbsoluteTimeRange,
  DefaultTimeRange,
  toUtc,
  PanelEvents,
  PanelData, 
  PanelPlugin,
  FieldConfigSource,
  theme,
  ErrorBoundary,
} from 'src/packages/datav-core';



const DEFAULT_PLUGIN_ERROR = 'Error in plugin';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  plugin: PanelPlugin;
  isViewing: boolean;
  isEditing?: boolean;
  isInView: boolean;
  width: number;
  height: number;
  alertState: string;
}

export interface State {
  isFirstLoad: boolean;
  renderCounter: number;
  errorMessage?: string;
  refreshWhenInView: boolean;
  data: PanelData;
}

export class Panel extends PureComponent<Props, State> {
  timeSrv: TimeSrv = getTimeSrv();
  querySubscription: Unsubscribable;

  constructor(props: Props) {
    super(props);

    this.state = {
      isFirstLoad: true,
      renderCounter: 0,
      refreshWhenInView: false,
      data: {
        state: LoadingState.NotStarted,
        series: [],
        timeRange: DefaultTimeRange,
      },
    };
  }

  componentDidMount() {
    const { panel, dashboard } = this.props;
    panel.events.on(PanelEvents.panelInitialized, () => { });
    panel.events.on(PanelEvents.refresh, () => this.onRefresh(true));
    panel.events.on(PanelEvents.render, () => this.onRender(true));

    dashboard.panelInitialized(this.props.panel);


    if (!this.wantsQueryExecution) {
      this.setState({ isFirstLoad: false });
    }



    this.querySubscription = panel
      .getQueryRunner()
      .getData({ withTransforms: true, withFieldConfig: true })
      .subscribe({
        next: data => {
          this.onDataUpdate(data)
        }
      });
  }

  componentWillUnmount() {
    this.props.panel.events.off(PanelEvents.refresh, this.onRefresh);
    this.props.panel.events.off(PanelEvents.render, this.onRender);
    this.props.panel.events.off(PanelEvents.panelInitialized, () => { });

    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { isInView } = this.props;

    // View state has changed
    if (isInView !== prevProps.isInView) {
      if (isInView) {
        // Check if we need a delayed refresh
        if (this.state.refreshWhenInView) {
          this.onRefresh();
        }
      }
    }
  }

  // Updates the response with information from the stream
  // The next is outside a react synthetic event so setState is not batched
  // So in this context we can only do a single call to setState
  onDataUpdate(data: PanelData) {
    if (!this.props.isInView) {
      // Ignore events when not visible.
      // The call will be repeated when the panel comes into view
      return;
    }

    let { isFirstLoad } = this.state;
    let errorMessage: string | undefined;

    switch (data.state) {
      case LoadingState.Loading:
        // Skip updating state data if it is already in loading state
        // This is to avoid rendering partial loading responses
        if (this.state.data.state === LoadingState.Loading) {
          return;
        }
        break;
      case LoadingState.Error:
        const { error } = data;
        if (error) {
          if (errorMessage !== error.message) {
            errorMessage = error.message;
          }
        }
        break;
      case LoadingState.Done:
        if (isFirstLoad) {
          isFirstLoad = false;
        }
        break;
    }

    this.setState({ isFirstLoad, errorMessage, data });
  }

  onRefresh = (fromEvents?: boolean) => {
    const { panel, isInView, width } = this.props;
    if (!isInView) {
      this.setState({ refreshWhenInView: true });
      return;
    }


    // Issue Query
    if (this.wantsQueryExecution) {
      if (width < 0) {
        console.log('Refresh skippted, no width yet... wait till we know');
        return;
      }
      panel.getQueryRunner().run({
        datasource: panel.datasource,
        queries: panel.targets,
        panelId: panel.id,
        dashboardId: this.props.dashboard.id,
        timezone: this.timeSrv.timezone,
        timeRange: this.timeSrv.timeRange(),
        timeInfo: "",
        maxDataPoints: panel.maxDataPoints || width,
        minInterval: panel.interval,
        scopedVars: panel.scopedVars,
        cacheTimeout: panel.cacheTimeout,
        transformations: panel.transformations,
      });
    } else {
      // The panel should render on refresh as well if it doesn't have a query, like clock panel
      this.onRender();
    }
  };

  onRender = (fromEvents?: boolean) => {
    const stateUpdate = { renderCounter: this.state.renderCounter + 1 };
    this.setState(stateUpdate);
  };

  onOptionsChange = (options: any) => {
    this.props.panel.updateOptions(options);
  };

  onFieldConfigChange = (config: FieldConfigSource) => {
    this.props.panel.updateFieldConfig(config);
  };

  onPanelError = (message: string) => {
    if (this.state.errorMessage !== message) {
      this.setState({ errorMessage: message });
    }
  };


  get wantsQueryExecution() {
    return !(this.props.plugin.meta.skipDataQuery);
  }

  onChangeTimeRange = (timeRange: AbsoluteTimeRange) => {
    this.timeSrv.setTime({
      from: toUtc(timeRange.from),
      to: toUtc(timeRange.to),
    }, true);
  };

  renderPanel(width: number, height: number, dashboard: DashboardModel) {
    const { panel, plugin } = this.props;
    const { renderCounter, data, isFirstLoad } = this.state;

    // This is only done to increase a counter that is used by backend
    // image rendering to know when to capture image
    const loading = data.state;
    if (loading === LoadingState.Done) {
    }

    // do not render component until we have first data
    if (isFirstLoad && (loading === LoadingState.Loading || loading === LoadingState.NotStarted)) {
      return null;
    }

    const PanelComponent = plugin.panel;
    const timeRange = data.timeRange || this.timeSrv.timeRange();
    const headerHeight = this.hasOverlayHeader() ? 0 : theme.panelHeaderHeight;
    const chromePadding = plugin.noPadding ? 0 : theme.panelPadding;
    const panelWidth = width - chromePadding * 2 - PANEL_BORDER;
    const innerPanelHeight = height - headerHeight - chromePadding * 2 - PANEL_BORDER;
    const panelContentClassNames = classNames({
      'panel-content': true,
      'panel-content--no-padding': plugin.noPadding,
    });

    return (
      <>
        <div className={panelContentClassNames}>
          <PanelComponent
            id={panel.id}
            dashboardID={dashboard.id}
            data={data}
            timeRange={timeRange}
            timeZone={this.timeSrv.timezone}
            options={panel.options}
            fieldConfig={panel.fieldConfig}
            transparent={panel.transparent}
            width={panelWidth}
            height={innerPanelHeight}
            renderCounter={renderCounter}
            replaceVariables={panel.replaceVariables}
            onOptionsChange={this.onOptionsChange}
            onFieldConfigChange={this.onFieldConfigChange}
            onChangeTimeRange={this.onChangeTimeRange}
            // only legacy grafana panels need these
            panel={panel}
            dashboard={panel.type === 'graph' ? dashboard : null}
          />
        </div>
      </>
    );
  }

  hasOverlayHeader() {
    const { panel } = this.props;
    const { errorMessage, data } = this.state;

    // always show normal header if we have an error message
    if (errorMessage) {
      return false;
    }

    // always show normal header if we have time override
    if (data.request && data.request.timeInfo) {
      return false;
    }

    return !panel.hasTitle();
  }

  render() {
    const { dashboard, panel, isViewing, isEditing, width, height,alertState} = this.props;
    const { errorMessage, data } = this.state;
    const { transparent } = panel;

    const containerClassNames = classNames({
      'panel-container': true,
      'panel-container--absolute': true,
      'panel-container--transparent': transparent,
      'panel-container--no-title': this.hasOverlayHeader(),
      'panel-has-alert': panel.alert !== undefined,
      [`panel-alert-state--${alertState}`]: alertState !== undefined,
    });

    return (
      <div className={containerClassNames}>
        <PanelHeader
          panel={panel}
          dashboard={dashboard}
          title={panel.title}
          description={panel.description}
          scopedVars={panel.scopedVars}
          error={errorMessage}
          isEditing={isEditing}
          isViewing={isViewing}
          data={data}
          alertState={alertState}
        />
        <ErrorBoundary>
          {({ error }) => {
            if (error) {
              this.onPanelError(error.message || DEFAULT_PLUGIN_ERROR);
              return null;
            }
            return this.renderPanel(width, height, dashboard);
          }}
        </ErrorBoundary>
      </div>
    );
  }
}
