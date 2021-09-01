import _ from 'lodash'
import {
    PanelProps, PanelData, DataFrame, TimeRange, PanelEvents,getValueFormat,formattedValueToString,dateTimeFormat,
    getFlotPairsConstant,getTimeField,AnnotationEvent,currentTheme, getBootConfig, getColorForTheme
} from 'src/packages/datav-core/src';
import { DashboardModel } from 'src/views/dashboard/model/DashboardModel'
import { PanelModel } from 'src/views/dashboard/model/PanelModel'
import { DataProcessor } from './data_processor'

import { Emitter } from 'src/core/library/utils/emitter';
import { DataWarning } from './types'
import { getDataTimeRange } from './utils'
import { tickStep } from 'src/core/library/utils/ticks';
import { convertToHistogramData } from './histogram'
import { getTimeSrv } from 'src/core/services/time';
import { GraphContextMenuCtrl } from './GraphContextMenuCtrl';
import {store} from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location';
import { annotationsSrv } from 'src/core/services/annotations';

export class GraphPanelCtrl {
    id: number;
    dashboard: DashboardModel;
    panel: PanelModel;

    panelWidth: number;
    panelHeight: number;

    rawData: PanelData;

    // convert dataList to seriesList
    processor: DataProcessor;
    // final graph data
    seriesList: any[];
    // raw panel data
    dataList: DataFrame[];

    timeRange: TimeRange;
    timezone: string;
    graphOptions: GraphOptions;
    events: Emitter;
    dataWarning?: DataWarning;

    renderError: boolean;
    error:any;
    
    annotations: AnnotationEvent[] = [];

    hiddenSeriesTainted = false;
    hiddenSeries: any = {};
    contextMenuCtrl: GraphContextMenuCtrl;

    constructor(props: PanelProps,parent:any) {
        const {dashboard, panel,height,width,options} = props
        this.id = panel.id
        this.dashboard = dashboard
        this.panel = panel
        this.panelHeight = height
        this.panelWidth = width
       
        _.defaults(options, graphOptionsDefaults);
        _.defaults(options.tooltip, graphOptionsDefaults.tooltip);
        _.defaults(options.legend, graphOptionsDefaults.legend);
        _.defaults(options.xaxis, graphOptionsDefaults.xaxis);
        _.defaults(options.options, graphOptionsDefaults.options);
        
        this.graphOptions = options

        this.contextMenuCtrl = new GraphContextMenuCtrl(parent);
        this.processor = new DataProcessor(this.graphOptions);

        this.timezone = getTimeSrv().timezone

       
        this.events = this.panel.events;
        
  
        this.setAnnotations()
        this.prepareRenderData(props)
    }

    setAnnotations() {
      this.annotations = []
      if (annotationsSrv.annotations) {
        for (const an of annotationsSrv.annotations) {
          if (an.panelId === this.id) {
            this.annotations.push(an)
          }
        }
      }
    }
    updateOptions(options) {
      this.graphOptions = options
    }

    processSerries() {
      for (const series of this.seriesList) {
        series.applySeriesOverrides(this.graphOptions.seriesOverrides);

        if (series.unit) {
          this.graphOptions.yaxes[series.yaxis - 1].format = series.unit;
        }
        if (this.hiddenSeriesTainted === false && series.hiddenSeries === true) {
          this.hiddenSeries[series.alias] = true;
        }
      }
    }

    onContextMenuClose = () => {
      this.contextMenuCtrl.toggleMenu();
    }
    
    prepareRenderData(props: PanelProps) {
      this.timeRange = props.timeRange
      this.dataList = props.data.series
      

      this.seriesList = this.processor.getSeriesList({
          dataList: this.dataList,
          range: this.timeRange,
      });

      this.dataWarning = this.getDataWarning();
    }

    render(payload?: any) {
        this.events.emit(PanelEvents.render, payload);
    }


    getDataWarning(): DataWarning {
        const datapointsCount = this.seriesList.reduce((prev, series) => {
            return prev + series.datapoints.length;
        }, 0);

        if (datapointsCount === 0) {
            if (this.dataList) {
                for (const frame of this.dataList) {
                    if (frame.length && frame.fields?.length) {
                        return {
                            title: 'Unable to graph data',
                            tip: 'Data exists, but is not timeseries',
                            actionText: 'Switch to table view',
                            action: () => {
                                console.log('Change from graph to table');
                                //@todo
                                // dispatch(changePanelPlugin(this.panel, 'table'));
                            },
                        };
                    }
                }
            }

            return {
                title: 'No data',
                tip: 'No data returned from query',
            };
        }

        // Look for data points outside time range
        for (const series of this.seriesList) {
            if (!series.isOutsideRange) {
                continue;
            }

            const dataWarning: DataWarning = {
                title: 'Data outside time range',
                tip: 'Can be caused by timezone mismatch or missing time filter in query',
            };

            const range = getDataTimeRange(this.dataList);

            if (range) {
                dataWarning.actionText = 'Zoom to data';
                dataWarning.action = () => {
                    store.dispatch(updateLocation({
                        partial: true,
                        query: {
                            from: range.from,
                            to: range.to,
                        },
                    }))
                };
            }

            return dataWarning;
        }

        return null;
    }

    otherPanelInFullscreenMode() {
        return this.dashboard.otherPanelInFullscreen(this.panel);
    }



    getFillGradient(amount: number) {
        if (!amount) {
            return null;
        }

        return {
            colors: [{ opacity: 0.0 }, { opacity: amount / 10 }],
        };
    }

    translateFillOption(fill: number) {
        if (this.graphOptions.percentage && this.graphOptions.stack) {
            return fill === 0 ? 0.001 : fill / 10;
        } else {
            return fill / 10;
        }
    }


    addXHistogramAxis(options: any, bucketSize: number) {
        let ticks: number | number[];
        let min: number | undefined;
        let max: number | undefined;

        const defaultTicks = this.panelWidth / 50;

        if (this.seriesList.length && bucketSize) {
            const tickValues = [];

            for (const d of this.seriesList) {
                for (const point of d.data) {
                    tickValues[point[0]] = true;
                }
            }

            ticks = Object.keys(tickValues).map(v => Number(v));
            min = _.min(ticks)!;
            max = _.max(ticks)!;

            // Adjust tick step
            let tickStep = bucketSize;
            let ticksNum = Math.floor((max - min) / tickStep);
            while (ticksNum > defaultTicks) {
                tickStep = tickStep * 2;
                ticksNum = Math.ceil((max - min) / tickStep);
            }

            // Expand ticks for pretty view
            min = Math.floor(min / tickStep) * tickStep;
            // 1.01 is 101% - ensure we have enough space for last bar
            max = Math.ceil((max * 1.01) / tickStep) * tickStep;

            ticks = [];
            for (let i = min; i <= max; i += tickStep) {
                ticks.push(i);
            }
        } else {
            // Set defaults if no data
            ticks = defaultTicks / 2;
            min = 0;
            max = 1;
        }

        options.xaxis = {
            timezone: this.timezone,
            show: this.graphOptions.xaxis.show,
            mode: null,
            min: min,
            max: max,
            label: 'Histogram',
            ticks: ticks,
        };

        // Use 'short' format for histogram values
        this.configureAxisMode(options.xaxis, 'short');
    }

    addXTableAxis(options: any) {
        let ticks = _.map(this.seriesList, (series, seriesIndex) => {
            return _.map(series.datapoints, (point, pointIndex) => {
                const tickIndex = seriesIndex * series.datapoints.length + pointIndex;
                return [tickIndex + 1, point[1]];
            });
        });
        // @ts-ignore, potential bug? is this _.flattenDeep?
        ticks = _.flatten(ticks, true);

        options.xaxis = {
            timezone: this.timezone,
            show: this.graphOptions.xaxis.show,
            mode: null,
            min: 0,
            max: ticks.length + 1,
            label: 'Datetime',
            ticks: ticks,
        };
    }

    addXSeriesAxis(options: any) {
        const ticks = _.map(this.seriesList, (series, index) => {
            return [index + 1, series.alias];
        });

        options.xaxis = {
            timezone: this.timezone,
            show: this.graphOptions.xaxis.show,
            mode: null,
            min: 0,
            max: ticks.length + 1,
            label: 'Datetime',
            ticks: ticks,
        };
    }

    prepareXAxis(options: any) {
        switch (this.graphOptions.xaxis.mode) {
            case 'series': {
                options.series.bars.barWidth = 0.7;
                options.series.bars.align = 'center';

                for (let i = 0; i < this.seriesList.length; i++) {
                    const series = this.seriesList[i];
                    series.data = [[i + 1, series.stats[this.graphOptions.xaxis.values[0]]]];
                }

                this.addXSeriesAxis(options);
                break;
            }
            case 'histogram': {
                let bucketSize: number;

                if (this.seriesList.length) {
                    let histMin = _.min(_.map(this.seriesList, s => s.stats.min));
                    let histMax = _.max(_.map(this.seriesList, s => s.stats.max));
                    const ticks = this.graphOptions.xaxis.buckets || this.panelWidth / 50;
                    if (this.graphOptions.xaxis.min != null) {
                        const isInvalidXaxisMin = tickStep(this.graphOptions.xaxis.min, histMax, ticks) <= 0;
                        histMin = isInvalidXaxisMin ? histMin : this.graphOptions.xaxis.min;
                    }
                    if (this.graphOptions.xaxis.max != null) {
                        const isInvalidXaxisMax = tickStep(histMin, this.graphOptions.xaxis.max, ticks) <= 0;
                        histMax = isInvalidXaxisMax ? histMax : this.graphOptions.xaxis.max;
                    }
                    bucketSize = tickStep(histMin, histMax, ticks);
                    options.series.bars.barWidth = bucketSize * 0.8;
                    this.seriesList = convertToHistogramData(this.seriesList, bucketSize, this.hiddenSeries, histMin, histMax);
                } else {
                    bucketSize = 0;
                }

                this.addXHistogramAxis(options, bucketSize);
                break;
            }
            case 'table': {
                options.series.bars.barWidth = 0.7;
                options.series.bars.align = 'center';
                this.addXTableAxis(options);
                break;
            }
            default: {
                options.series.bars.barWidth = this.getMinTimeStepOfSeries(this.seriesList) / 1.5;
                options.series.bars.align = 'center';
                this.addTimeAxis(options);
                break;
            }
        }
    }

    configureAxisMode(axis: { tickFormatter: (val: any, axis: any) => string }, format: string) {
        axis.tickFormatter = (val, axis) => {
            const formatter = getValueFormat(format);

            if (!formatter) {
                throw new Error(`Unit '${format}' is not supported`);
            }
            return formattedValueToString(formatter(val, axis.tickDecimals, axis.scaledDecimals));
        };
    }

      // Series could have different timeSteps,
  // let's find the smallest one so that bars are correctly rendered.
  // In addition, only take series which are rendered as bars for this.
  getMinTimeStepOfSeries(data: any[]) {
    let min = Number.MAX_VALUE;

    for (let i = 0; i < data.length; i++) {
      if (!data[i].stats.timeStep) {
        continue;
      }
      if (this.graphOptions.bars) {
        if (data[i].bars && data[i].bars.show === false) {
          continue;
        }
      } else {
        if (typeof data[i].bars === 'undefined' || typeof data[i].bars.show === 'undefined' || !data[i].bars.show) {
          continue;
        }
      }

      if (data[i].stats.timeStep < min) {
        min = data[i].stats.timeStep;
      }
    }

    return min;
  }

  addTimeAxis(options: any) {
    const ticks = this.panelWidth / 100;
    const min = _.isUndefined(this.timeRange.from) ? null : this.timeRange.from.valueOf();
    const max = _.isUndefined(this.timeRange.to) ? null : this.timeRange.to.valueOf();

    options.xaxis = {
      timezone: this.timezone,
      show: this.graphOptions.xaxis.show,
      mode: 'time',
      min: min,
      max: max,
      label: 'Datetime',
      ticks: ticks,
      timeformat: this.graphTimeFormat(ticks, min, max),
      tickFormatter: this.graphTickFormatter,
    };
  }

   graphTickFormatter = (epoch: number, axis: any) => {
    return dateTimeFormat(epoch, {
      format: axis?.options?.timeformat,
      timeZone: axis?.options?.timezone,
    });
  };

  
  graphTimeFormat(ticks: number | null, min: number | null, max: number | null): string {
    if (min && max && ticks) {
      const range = max - min;
      const secPerTick = range / ticks / 1000;
      // Need have 10 millisecond margin on the day range
      // As sometimes last 24 hour dashboard evaluates to more than 86400000
      const oneDay = 86400010;
      const oneYear = 31536000000;
  
      if (secPerTick <= 45) {
        return 'HH:mm:ss';
      }
      if (secPerTick <= 7200 || range <= oneDay) {
        return 'HH:mm';
      }
      if (secPerTick <= 80000) {
        return 'MM/DD HH:mm';
      }
      if (secPerTick <= 2419200 || range <= oneYear) {
        return 'MM/DD';
      }
      return 'YYYY-MM';
    }
  
    return 'HH:mm';
  };
  configureYAxisOptions(data: any, options: any) {
    const defaults = {
      position: 'left',
      show: this.graphOptions.yaxes[0].show,
      index: 1,
      logBase: this.graphOptions.yaxes[0].logBase || 1,
      min: this.parseNumber(this.graphOptions.yaxes[0].min),
      max: this.parseNumber(this.graphOptions.yaxes[0].max),
      tickDecimals: this.graphOptions.yaxes[0].decimals,
    };

    options.yaxes.push(defaults);

    if (_.find(data, { yaxis: 2 })) {
      const secondY = _.clone(defaults);
      secondY.index = 2;
      secondY.show = this.graphOptions.yaxes[1].show;
      secondY.logBase = this.graphOptions.yaxes[1].logBase || 1;
      secondY.position = 'right';
      secondY.min = this.parseNumber(this.graphOptions.yaxes[1].min);
      secondY.max = this.parseNumber(this.graphOptions.yaxes[1].max);
      secondY.tickDecimals = this.graphOptions.yaxes[1].decimals;
      options.yaxes.push(secondY);

      this.applyLogScale(options.yaxes[1], data);
      this.configureAxisMode(
        options.yaxes[1],
        this.graphOptions.percentage && this.graphOptions.stack ? 'percent' : this.graphOptions.yaxes[1].format
      );
    }
    this.applyLogScale(options.yaxes[0], data);
    this.configureAxisMode(
      options.yaxes[0],
      this.graphOptions.percentage && this.graphOptions.stack ? 'percent' : this.graphOptions.yaxes[0].format
    );
  }

  parseNumber(value: any) {
    if (value === null || typeof value === 'undefined') {
      return null;
    }

    return _.toNumber(value);
  }

  applyLogScale(axis: any, data: any) {
    if (axis.logBase === 1) {
      return;
    }

    const minSetToZero = axis.min === 0;

    if (axis.min < Number.MIN_VALUE) {
      axis.min = null;
    }
    if (axis.max < Number.MIN_VALUE) {
      axis.max = null;
    }

    let series, i;
    let max = axis.max,
      min = axis.min;

    for (i = 0; i < data.length; i++) {
      series = data[i];
      if (series.yaxis === axis.index) {
        if (!max || max < series.stats.max) {
          max = series.stats.max;
        }
        if (!min || min > series.stats.logmin) {
          min = series.stats.logmin;
        }
      }
    }

    axis.transform = (v: number) => {
      return v < Number.MIN_VALUE ? null : Math.log(v) / Math.log(axis.logBase);
    };
    axis.inverseTransform = (v: any) => {
      return Math.pow(axis.logBase, v);
    };

    
    if (!max && !min) {
      max = axis.inverseTransform(+2);
      min = axis.inverseTransform(-2);
    } else if (!max) {
      max = min * axis.inverseTransform(+4);
    } else if (!min) {
      min = max * axis.inverseTransform(-4);
    }

    if (axis.min) {
      min = axis.inverseTransform(Math.ceil(axis.transform(axis.min)));
    } else {
      min = axis.min = axis.inverseTransform(Math.floor(axis.transform(min)));
    }
    if (axis.max) {
      max = axis.inverseTransform(Math.floor(axis.transform(axis.max)));
    } else {
      max = axis.max = axis.inverseTransform(Math.ceil(axis.transform(max)));
    }


    if (!min || min < Number.MIN_VALUE || !max || max < Number.MIN_VALUE) {
      return;
    }

    if (Number.isFinite(min) && Number.isFinite(max)) {
      if (minSetToZero) {
        axis.min = 0.1;
        min = 1;
      }

      axis.ticks = this.generateTicksForLogScaleYAxis(min, max, axis.logBase);
      if (minSetToZero) {
        axis.ticks.unshift(0.1);
      }
      if (axis.ticks[axis.ticks.length - 1] > axis.max) {
        axis.max = axis.ticks[axis.ticks.length - 1];
      }
    } else {
      axis.ticks = [1, 2];
      delete axis.min;
      delete axis.max;
    }
  }

  generateTicksForLogScaleYAxis(min: any, max: number, logBase: number) {
    let ticks = [];

    let nextTick;
    for (nextTick = min; nextTick <= max; nextTick *= logBase) {
      ticks.push(nextTick);
    }

    const maxNumTicks = Math.ceil(this.panelHeight / 25);
    const numTicks = ticks.length;
    if (numTicks > maxNumTicks) {
      const factor = Math.ceil(numTicks / maxNumTicks) * logBase;
      ticks = [];

      for (nextTick = min; nextTick <= max * factor; nextTick *= factor) {
        ticks.push(nextTick);
      }
    }

    return ticks;
  }

  sortSeries() {
    const sortBy = this.graphOptions.legend.sort;
    const sortOrder = this.graphOptions.legend.sortDesc;
    const haveSortBy = sortBy !== null && sortBy !== undefined && this.graphOptions.legend[sortBy];
    const haveSortOrder = sortOrder !== null && sortOrder !== undefined;
    const shouldSortBy = this.graphOptions.stack && haveSortBy && haveSortOrder && this.graphOptions.legend.alignAsTable;
    const sortDesc = this.graphOptions.legend.sortDesc === true ? -1 : 1;

    if (shouldSortBy) {
      return _.sortBy(this.seriesList, s => s.stats[sortBy] * sortDesc);
    } else {
      return _.sortBy(this.seriesList, s => s.zindex);
    }
  }

  buildFlotPairs(data: any) {
    for (let i = 0; i < data.length; i++) {
      const series = data[i];
      series.data = series.getFlotPairs(series.nullPointMode || this.graphOptions.nullPointMode);

      if (series.transform === 'constant') {
        series.data = getFlotPairsConstant(series.data, this.timeRange);
      }

      // if hidden remove points and disable stack
      if (this.hiddenSeries[series.alias]) {
        series.data = [];
        series.stack = false;
      }
    }
  }

  onColorChange = (series: any, color: string) => {
    const config = getBootConfig()
    series.setColor(getColorForTheme(color, config.theme));
    this.graphOptions.aliasColors[series.alias] = color;
    this.render();
  };

  onToggleSeries = (hiddenSeries: any) => {
    this.hiddenSeriesTainted = true;
    this.hiddenSeries = hiddenSeries;
    this.render();
  };

  onToggleSort = (sortBy: any, sortDesc: any) => {
    this.graphOptions.legend.sort = sortBy;
    this.graphOptions.legend.sortDesc = sortDesc;
    this.render();
  };
 
  onToggleAxis = (info: { alias: any; yaxis: any }) => {
    let override: any = _.find(this.graphOptions.seriesOverrides, { alias: info.alias });
    if (!override) {
      override = { alias: info.alias };
      this.graphOptions.seriesOverrides.push(override);
    }
    override.yaxis = info.yaxis;
    this.render();
  };

  getDataIndexWithNullValuesCorrection(item: any, dataFrame: DataFrame): number {
    /** This is one added to handle the scenario where we have null values in
     *  the time series data and the: "visualization options -> null value"
     *  set to "connected". In this scenario we will get the wrong dataIndex.
     */
    const { datapoint, dataIndex } = item;

    if (!Array.isArray(datapoint) || datapoint.length === 0) {
      return dataIndex;
    }

    const ts = datapoint[0];
    const { timeField } = getTimeField(dataFrame);

    if (!timeField || !timeField.values) {
      return dataIndex;
    }

    const field = timeField.values.get(dataIndex);

    if (field === ts) {
      return dataIndex;
    }

    const correctIndex = timeField.values.toArray().findIndex(value => value === ts);
    return correctIndex > -1 ? correctIndex : dataIndex;
  }
}

export interface GraphOptions {
     // datasource name, null = default datasource
     datasource: any,
     // sets client side (flot) or native graphite png renderer (png)
     renderer: string,
     yaxes: any[],
     xaxis: any,
     yaxis: any,
     // show/hide lines
     lines: boolean,
     // fill factor
     fill: number,
     // fill gradient
     fillGradient: number,
     // line width in pixels
     linewidth: number,
     // show/hide dashed line
     dashes: boolean,
     // show/hide line
     hiddenSeries: boolean,
     // length of a dash
     dashLength: number,
     // length of space between two dashes
     spaceLength: number,
     // show hide points
     points: boolean,
     // point radius in pixels
     pointradius: number,
     // show hide bars
     bars: boolean,
     // enable/disable stacking
     stack: boolean,
     // stack percentage mode
     percentage: boolean,
     // legend options
     legend: any,
     // how null points should be handled
     nullPointMode: string,
     // staircase line mode
     steppedLine: boolean,
     // tooltip options
     tooltip: any,
     // time overrides
     timeFrom: any,
     timeShift: any,
     // metric queries
     targets: any[],
     // series color overrides
     aliasColors: any,
     // other style overrides
     seriesOverrides: any[],
     thresholds: any[],
     timeRegions: any[],
     options: any,
     decimals:number;
}
const graphOptionsDefaults: any = {
    // datasource name, null = default datasource
    datasource: null,
    // sets client side (flot) or native graphite png renderer (png)
    renderer: 'flot',
    yaxes: [
        {
            label: null,
            show: true,
            logBase: 1,
            min: null,
            max: null,
            format: 'short',
        },
        {
            label: null,
            show: true,
            logBase: 1,
            min: null,
            max: null,
            format: 'short',
        },
    ],
    xaxis: {
        show: true,
        mode: 'time',
        name: null,
        values: [],
        buckets: null,
    },
    yaxis: {
        align: false,
        alignLevel: null,
    },
    // show/hide lines
    lines: true,
    // fill factor
    fill: 1,
    // fill gradient
    fillGradient: 5,
    // line width in pixels
    linewidth: 1,
    // show/hide dashed line
    dashes: false,
    // show/hide line
    hiddenSeries: false,
    // length of a dash
    dashLength: 10,
    // length of space between two dashes
    spaceLength: 10,
    // show hide points
    points: false,
    // point radius in pixels
    pointradius: 2,
    // show hide bars
    bars: false,
    // enable/disable stacking
    stack: false,
    // stack percentage mode
    percentage: false,
    decimals: 2,
    // legend options
    legend: {
        show: true, // disable/enable legend
        values: false, // disable/enable legend values
        min: false,
        max: false,
        current: true,
        total: false,
        avg: false,
        alignAsTable: true,
        sort: "current",
        sortDesc: true,
    },
    // how null points should be handled
    nullPointMode: 'null',
    // staircase line mode
    steppedLine: false,
    // tooltip options
    tooltip: {
        value_type: 'individual',
        shared: true,
        sort: 0,
    },
    // time overrides
    timeFrom: null,
    timeShift: null,
    // metric queries
    targets: [{}],
    // series color overrides
    aliasColors: {},
    // other style overrides
    seriesOverrides: [],
    thresholds: [],
    // thresholds: [{
    //   colorMode: "critical",
    //   fill: true,
    //   line: true,
    //   op: "gt",
    //   value: 0.5,
    //   yaxis: "left"}],
    timeRegions: [],
    options: {
        dataLinks: [],
    },
};