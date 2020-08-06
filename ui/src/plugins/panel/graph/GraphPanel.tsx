import $ from 'jquery';
import ReactDOM from 'react-dom';
import '../vendor/flot/jquery.flot';
import '../vendor/flot/jquery.flot.selection';
import '../vendor/flot/jquery.flot.time';
import '../vendor/flot/jquery.flot.stack';
import '../vendor/flot/jquery.flot.stackpercent';
import '../vendor/flot/jquery.flot.fillbelow';
import '../vendor/flot/jquery.flot.crosshair';
import '../vendor/flot/jquery.flot.dashes';
import '../vendor/flot/jquery.flot.gauge';
import './jquery.flot.events';
import './GraphPanel.less'

import React, { PureComponent } from 'react';
import _ from 'lodash'
import Drop from 'tether-drop';

import {
  PanelProps, PanelEvents, toUtc, LinkModelSupplier, FieldDisplay, hasLinks, getDisplayProcessor, FieldType,
  DataFrameView, ContextMenuGroup, ContextMenuItem, currentTheme, ThemeType
} from 'src/packages/datav-core';
import { GraphPanelOptions } from './types'
import { GraphPanelCtrl } from './GraphPanelCtrl'
import { CoreEvents } from 'src/types';
import appEvents from 'src/core/library/utils/app_events';
import { getTimeSrv } from 'src/core/services/time'
import { EventManager } from 'src/views/annotations/event_manager';
import classNames from 'classnames';
import { ThresholdManager } from './threshold_manager';
import { alignYLevel } from './utils'
import { updateLegendValues } from 'src/core/time_series';
import GraphTooltip from './graph_tooltip'
import { GraphLegendProps, Legend } from './Legend/Legend';
import { getFieldLinksSupplier } from 'src/views/panel/panellinks/linkSuppliers';
import { GraphContextMenuCtrl } from './GraphContextMenuCtrl';
import { GraphContextMenu } from './GraphContextMenu';
import AnnotationEdior from 'src/views/annotations/AnnotationEditor'
import AnnotationTooltip from 'src/views/annotations/AnnotationTooltip'
import { annotationsSrv } from 'src/core/services/annotations';

interface State {
  contextMenuVisible: boolean
}
export class GraphPanel extends PureComponent<PanelProps<GraphPanelOptions>, State> {
  ctrl: GraphPanelCtrl;
  plot: any;
  sortedSeries: any[];
  elem: JQuery;
  tooltip: any;
  eventManager: EventManager;
  thresholdManager: ThresholdManager;
  currentProps: any;
  currentRenderTimer: any;
  contextMenu: GraphContextMenuCtrl;
  tempAnnotation: any;

  constructor(props: PanelProps) {
    super(props)
    this.state = {
      contextMenuVisible: false
    }
    this.currentProps = {}

    this.ctrl = new GraphPanelCtrl(props, this)
    this.currentRenderTimer = null

    this.contextMenu = this.ctrl.contextMenuCtrl
    this.eventManager = new EventManager(this.ctrl);
    this.thresholdManager = new ThresholdManager(this.ctrl);

    this.onPanelTeardown = this.onPanelTeardown.bind(this)
    this.onRender = this.onRender.bind(this)
    this.ctrl.events.on(PanelEvents.panelTeardown, this.onPanelTeardown);
    this.ctrl.events.on(PanelEvents.render, this.onRender);

    
    // global events
    this.onGraphHover = this.onGraphHover.bind(this)
    this.onGraphHoverClear = this.onGraphHoverClear.bind(this)
    this.showAnnotationEditor = this.showAnnotationEditor.bind(this)
    this.showAnnotationTooltip = this.showAnnotationTooltip.bind(this)

    appEvents.on(CoreEvents.graphHover, this.onGraphHover);
    appEvents.on(CoreEvents.graphHoverClear, this.onGraphHoverClear);

    appEvents.on('showAnnotationEditor', this.showAnnotationEditor)
    appEvents.on('showAnnotationTooltip', this.showAnnotationTooltip)
  }

  componentWillMount() {
  }

  componentWillUnmount() {
    this.ctrl.events.off(PanelEvents.panelTeardown, this.onPanelTeardown);
    this.ctrl.events.off(PanelEvents.render, this.onRender);

    appEvents.off(CoreEvents.graphHover, this.onGraphHover);
    appEvents.off(CoreEvents.graphHoverClear, this.onGraphHoverClear);
    appEvents.off('showAnnotationEditor', this.showAnnotationEditor)
    appEvents.off('showAnnotationTooltip', this.showAnnotationTooltip)
  }

  componentWillUpdate(prevProps) {
    this.ctrl.setAnnotations()
  }

  showAnnotationEditor(data) {
    let drop: any;
    const onChange = async (v) => {
      this.ctrl.render()
    }

    drop = new Drop({
      target: data.ele,
      content: `<div id="annotation-editor">1111</div>`,
      position: 'bottom center',
      classes: 'drop-popover drop-popover--form',
      openOn: 'click',
      tetherOptions: {
        constraints: [{ to: 'window', pin: true, attachment: 'both' }],
      }
    });

    drop.open();

    const close = () => {
      drop.close()
    }

    ReactDOM.render(
      <AnnotationEdior rawEvent={data.event} close={close} onChange={onChange}/>
      , document.getElementById('annotation-editor'));

    drop.on('close', () => {
      setTimeout(() => {
        this.eventManager.editorClosed();
        drop.destroy();
      });
    });
  }

  showAnnotationTooltip(data) {
    if (!data.event.id) {
      return 
    }
    let drop: any;
    drop = new Drop({
      target: data.ele,
      content: `<div id="annotation-tooltip"></div>`,
      position: 'bottom center',
      classes: 'drop-popover drop-popover--annotation',
      openOn: 'hover',
      hoverCloseDelay: 200,
      tetherOptions: {
        constraints: [{ to: 'window', pin: true, attachment: 'both' }],
      },
    });

    drop.open();

    const openEditor = () => {
      drop.close()
      this.showAnnotationEditor(data)
    }
    
    ReactDOM.render(
      <AnnotationTooltip event={data.event} onEdit={openEditor} />
      , document.getElementById('annotation-tooltip'));

    drop.on('close', () => {
      setTimeout(() => {
        drop.destroy();
      });
    });
  }

  onPanelTeardown() {
    this.plot?.destroy();
    this.plot = null;

    this.tooltip?.destroy();
    
    this.elem?.off();
    this.elem?.remove();
  }

  onRender() {
    //@todo 
    // 接收到eventsManager thresholdManager传来的渲染信号，重新渲染组件
    //这个应该怎么做?
  }
  onGraphHover(evt: any) {

    // ignore other graph hover events if shared tooltip is disabled
    if (!this.ctrl.dashboard.sharedTooltipModeEnabled()) {
      return;
    }


    // ignore if we are the emitter
    if (!this.plot || evt.panel.id === this.ctrl.panel.id || this.ctrl.otherPanelInFullscreenMode()) {
      return;
    }

    this.tooltip.show(evt.pos);
  }

  onGraphHoverClear() {
    if (this.plot) {
      this.tooltip.clear(this.plot);
    }
  }

  onPlotSelected(event: JQueryEventObject, ranges: any) {
    if (this.ctrl.graphOptions.xaxis.mode !== 'time') {
      // Skip if panel in histogram or series mode
      this.plot.clearSelection();
      return;
    }

    if ((ranges.ctrlKey || ranges.metaKey) && (this.ctrl.dashboard.meta.canEdit || this.ctrl.dashboard.meta.canMakeEditable)) {
      this.eventManager.updateTime(ranges.xaxis)
    } else {
      //@todo
      // maybe need force update
      getTimeSrv().setTime({
        from: toUtc(ranges.xaxis.from),
        to: toUtc(ranges.xaxis.to),
      }, true);
    }
  }

  onPlotClick(event: JQueryEventObject, pos: any, item: any) {
    const scrollContextElement = this.elem.closest('.view') ? this.elem.closest('.view').get()[0] : null;
    const contextMenuSourceItem = item;

    if (this.ctrl.graphOptions.xaxis.mode !== 'time') {
      // Skip if panel in histogram or series mode
      return;
    }

    if ((pos.ctrlKey || pos.metaKey) && (this.ctrl.dashboard.meta.canEdit || this.ctrl.dashboard.meta.canMakeEditable)) {
      // Skip if range selected (added in "plotselected" event handler)
      if (pos.x !== pos.x1) {
        return;
      }
      setTimeout(() => {
        this.eventManager.updateTime({ from: pos.x, to: null });
      }, 100);
      return;
    } else {
      this.tooltip.clear(this.plot);
      let linksSupplier: LinkModelSupplier<FieldDisplay> | undefined;

      if (item) {
        // pickup y-axis index to know which field's config to apply
        const yAxisConfig = this.ctrl.graphOptions.yaxes[item.series.yaxis.n === 2 ? 1 : 0];
        const dataFrame = this.ctrl.dataList[item.series.dataFrameIndex];
        const field = dataFrame.fields[item.series.fieldIndex];
        const dataIndex = this.ctrl.getDataIndexWithNullValuesCorrection(item, dataFrame);

        let links: any[] = this.ctrl.graphOptions.options.dataLinks || [];
        const hasLinksValue = hasLinks(field);
        if (hasLinksValue) {
          // Append the configured links to the panel datalinks
          links = [...links, ...field.config.links];
        }
        const fieldConfig = {
          decimals: yAxisConfig.decimals,
          links,
        };
        const fieldDisplay = getDisplayProcessor({
          field: { config: fieldConfig, type: FieldType.number },
          timeZone: this.ctrl.timezone,
        })(field.values.get(dataIndex));
        linksSupplier = links.length
          ? getFieldLinksSupplier({
            display: fieldDisplay,
            name: field.name,
            view: new DataFrameView(dataFrame),
            rowIndex: dataIndex,
            colIndex: item.series.fieldIndex,
            field: fieldConfig,
            hasLinks: hasLinksValue,
          })
          : undefined;
      }

      // this.scope.$apply(() => {
      // Setting nearest CustomScrollbar element as a scroll context for graph context menu
      this.contextMenu.setScrollContextElement(scrollContextElement);
      this.contextMenu.setSource(contextMenuSourceItem);
      this.contextMenu.setMenuItemsSupplier(this.getContextMenuItemsSupplier(pos, linksSupplier) as any);
      this.contextMenu.toggleMenu(pos);
      // });
    }
  }



  getContextMenuItemsSupplier = (
    flotPosition: { x: number; y: number },
    linksSupplier?: LinkModelSupplier<FieldDisplay>
  ): (() => ContextMenuGroup[]) => {
    return () => {
      // Fixed context menu items
      const items: ContextMenuGroup[] = [
        {
          items: [
            {
              label: 'Add annotation',
              icon: 'comment-alt',
              onClick: () => {
                this.eventManager.updateTime({ from: flotPosition.x, to: null })
              }
            }
          ],
        },
      ];

      if (!linksSupplier) {
        return items;
      }

      const dataLinks = [
        {
          items: linksSupplier.getLinks(this.ctrl.panel.scopedVars).map<ContextMenuItem>(link => {
            return {
              label: link.title,
              url: link.href,
              target: link.target,
              icon: `${link.target === '_self' ? 'link' : 'external-link-alt'}`,
              onClick: link.onClick,
            };
          }),
        },
      ];

      return [...items, ...dataLinks];
    };
  };

  shouldAbortRender() {
    if (!this.props.data) {
      return true;
    }

    if (this.ctrl.panelWidth === 0) {
      return true;
    }

    return false;
  }

  drawHook(plot: any) {
    const graphOptions = this.ctrl.graphOptions
    // add left axis labels
    if (graphOptions.yaxes[0].label && graphOptions.yaxes[0].show) {
      $("<div class='axisLabel left-yaxis-label flot-temp-elem'></div>")
        .text(graphOptions.yaxes[0].label)
        .appendTo(this.elem);
    }

    // add right axis labels
    if (graphOptions.yaxes[1].label && graphOptions.yaxes[1].show) {
      $("<div class='axisLabel right-yaxis-label flot-temp-elem'></div>")
        .text(graphOptions.yaxes[1].label)
        .appendTo(this.elem);
    }

    const { dataWarning } = this.ctrl;
    if (dataWarning) {
      const msg = $(`<div class="datapoints-warning flot-temp-elem">${dataWarning.title}</div>`);
      if (dataWarning.action) {
        $(`<button class="btn btn-secondary">${dataWarning.actionText}</button>`)
          .click(dataWarning.action)
          .appendTo(msg);
      }
      msg.appendTo(this.elem);
    }

    this.thresholdManager.draw(plot);
  }

  processOffsetHook(plot: any, gridMargin: { left: number; right: number }) {
    const left = this.ctrl.graphOptions.yaxes[0];
    const right = this.ctrl.graphOptions.yaxes[1];
    if (left.show && left.label) {
      gridMargin.left = 20;
    }
    if (right.show && right.label) {
      gridMargin.right = 20;
    }

    // apply y-axis min/max options
    const yaxis = plot.getYAxes();
    for (let i = 0; i < yaxis.length; i++) {
      const axis: any = yaxis[i];
      const panelOptions = this.ctrl.graphOptions.yaxes[i];
      axis.options.max = axis.options.max !== null ? axis.options.max : panelOptions.max;
      axis.options.min = axis.options.min !== null ? axis.options.min : panelOptions.min;
    }
  }

  processRangeHook(plot: any) {
    const yAxes = plot.getYAxes();
    const align = this.ctrl.graphOptions.yaxis.align || false;

    if (yAxes.length > 1 && align === true) {
      const level = this.ctrl.graphOptions.yaxis.alignLevel || 0;
      alignYLevel(yAxes, parseFloat(level));
    }
  }

  buildFlotOptions(ctrl: GraphPanelCtrl) {
    let gridColor = '#c8c8c8';
    if (currentTheme === ThemeType.Light) {
      gridColor = '#a1a1a1';
    }
    const stack = ctrl.graphOptions.stack ? true : null;
    const options: any = {
      hooks: {
        draw: [this.drawHook.bind(this)],
        processOffset: [this.processOffsetHook.bind(this)],
        processRange: [this.processRangeHook.bind(this)],
      },
      legend: { show: false },
      series: {
        stackpercent: ctrl.graphOptions.stack ? ctrl.graphOptions.percentage : false,
        stack: ctrl.graphOptions.percentage ? null : stack,
        lines: {
          show: ctrl.graphOptions.lines,
          zero: false,
          fill: this.ctrl.translateFillOption(ctrl.graphOptions.fill),
          fillColor: this.ctrl.getFillGradient(ctrl.graphOptions.fillGradient),
          lineWidth: ctrl.graphOptions.dashes ? 0 : ctrl.graphOptions.linewidth,
          steps: ctrl.graphOptions.steppedLine,
        },
        dashes: {
          show: ctrl.graphOptions.dashes,
          lineWidth: ctrl.graphOptions.linewidth,
          dashLength: [ctrl.graphOptions.dashLength, ctrl.graphOptions.spaceLength],
        },
        bars: {
          show: ctrl.graphOptions.bars,
          fill: 1,
          barWidth: 1,
          zero: false,
          lineWidth: 0,
        },
        points: {
          show: ctrl.graphOptions.points,
          fill: 1,
          fillColor: false,
          radius: ctrl.graphOptions.points ? ctrl.graphOptions.pointradius : 2,
        },
        shadowSize: 0,
      },
      yaxes: [],
      xaxis: {},
      grid: {
        minBorderMargin: 0,
        markings: [],
        backgroundColor: null,
        borderWidth: 0,
        hoverable: true,
        clickable: true,
        color: gridColor,
        margin: { left: 0, right: 0 },
        labelMarginX: 0,
        mouseActiveRadius: 30,
      },
      selection: {
        mode: 'x',
        color: '#666',
      },
      crosshair: {
        mode: 'x',
      },
    };
    return options;
  }

  callPlot(options: any) {
    if (!this.elem) {
      this.elem = $(`#datav-graph-${this.props.panel.id}`)
      this.elem.bind('plotselected', this.onPlotSelected.bind(this));
      this.elem.bind('plotclick', this.onPlotClick.bind(this));
      this.tooltip = new GraphTooltip(this.elem, this.ctrl.dashboard, this.ctrl, () => {
        return this.sortedSeries;
      });
    }

    try {
      this.plot = $.plot(this.elem, this.sortedSeries, options);
      if (this.ctrl.renderError) {
        delete this.ctrl.error;
      }

    } catch (e) {
      console.log('flotcharts error', e);
      this.ctrl.error = e.message || 'Render Error';
      this.ctrl.renderError = true;
    }
  }

  render() {
    if (this.shouldAbortRender()) {
      return;
    }
    this.ctrl.updateOptions(this.props.options)
    if (this.currentProps.data !== this.props.data) {
      this.ctrl.prepareRenderData(this.props)
    }
    this.currentProps = this.props

    this.ctrl.processSerries()
    
    this.ctrl.buildFlotPairs(this.ctrl.seriesList);


    // give space to alert editing
    this.thresholdManager.prepare(this.elem, this.ctrl.seriesList);

    // un-check dashes if lines are unchecked
    this.ctrl.graphOptions.dashes = this.ctrl.graphOptions.lines ? this.ctrl.graphOptions.dashes : false;

    // Populate element
    const options: any = this.buildFlotOptions(this.ctrl);
    this.ctrl.prepareXAxis(options);
    this.ctrl.configureYAxisOptions(this.ctrl.seriesList, options);
    this.thresholdManager.addFlotOptions(options, this.ctrl);
    this.eventManager.addFlotEvents(this.ctrl.annotations, options);
    this.sortedSeries = this.ctrl.sortSeries();


    // optimize the performance when re-sizing the graph
    if (this.currentRenderTimer) {
      console.log('graph clear last render timer,and set a new one')
      clearTimeout(this.currentRenderTimer)
    }

    setTimeout(() => {
      this.currentRenderTimer = null;
      this.callPlot(options)
    }, 100)

    const cssClasses = classNames({
      "graph-panel": true,
      'graph-panel--legend-right': this.ctrl.graphOptions.legend.rightSide
    });

    updateLegendValues(this.ctrl.seriesList, this.ctrl.graphOptions, this.ctrl.panelHeight);


    const { min, max, avg, current, total } = this.ctrl.graphOptions.legend;
    const values = min || max || avg || current || total
    const { alignAsTable, rightSide, sideWidth, sort, sortDesc, hideEmpty, hideZero } = this.ctrl.graphOptions.legend;
    const legendOptions = { alignAsTable, rightSide, sideWidth, sort, sortDesc, hideEmpty, hideZero };
    const valueOptions = { values, min, max, avg, current, total };
    const legendProps: GraphLegendProps = {
      seriesList: this.ctrl.seriesList,
      hiddenSeries: this.ctrl.hiddenSeries,
      ...legendOptions,
      ...valueOptions,
      onToggleSeries: this.ctrl.onToggleSeries,
      onToggleSort: this.ctrl.onToggleSort,
      onColorChange: this.ctrl.onColorChange,
      onToggleAxis: this.ctrl.onToggleAxis,
    };

    return (
      <div className={cssClasses}>
        <div className="graph-panel__chart" id={`datav-graph-${this.props.panel.id}`}>
        </div>
        <div className="graph-legend">
          {this.ctrl.graphOptions.legend.show ? <Legend {...legendProps} /> : <></>}
        </div>

        {this.state.contextMenuVisible ?
          <GraphContextMenu
            items={this.ctrl.contextMenuCtrl.menuItemsSupplier() as any}
            timeZone={this.ctrl.timezone}
            getContextMenuSource={this.ctrl.contextMenuCtrl.getSource}
            x={this.ctrl.contextMenuCtrl.position.x}
            y={this.ctrl.contextMenuCtrl.position.y}
            onClose={this.ctrl.onContextMenuClose}
          /> : <></>
        }
      </div>
    )
  }
}