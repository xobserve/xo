import { round, isEmpty, isNumber, isEqual, over } from "lodash";
import { ColorMode } from "src/data/constants";
import * as colorManipulator from 'components/uPlot/colorManipulator';
import { canvasCtx } from 'src/App';
import { OverrideItem, PanelProps } from "types/dashboard";
import uPlot from "uplot";
import { systemDateFormats } from "utils/datetime/formats";
import { dateTimeFormat } from "utils/datetime/formatter";
import customColors from "src/theme/colors";
import { formatUnit } from "components/unit";
import { measureText } from "utils/measureText";
import { SeriesData } from "types/seriesData";




const BarWidthFactor = 0.6
const BardMaxWidth = 200
// build uplot options based on given config

const axisSpace = ((self, axisIdx, scaleMin, scaleMax, plotDim) => {
    return calculateSpace(self, axisIdx, scaleMin, scaleMax, plotDim);
})

export const parseOptions = (config: PanelProps,rawData: SeriesData[], colorMode,inactiveSeries) => {


    const textColor = colorMode == ColorMode.Light ? customColors.textColorRGB.light :  customColors.textColorRGB.dark
    const axesColor = colorMode == ColorMode.Light ? "rgba(0, 10, 23, 0.09)" : "rgba(240, 250, 255, 0.09)"
    
    // build series
    const series = []
    // push time series option
    series.push({
        label: "Time",

    })

    const yAxis = [{
        grid: {
            show: config.panel.plugins.graph.axis?.showGrid,
            width: 0.5,
            stroke: axesColor
        },
        ticks: {
            size: 4
        },
        scale: 'y',
        stroke: textColor,
        space: axisSpace,
        size: ((self, values, axisIdx) => {
            return calculateAxisSize(self, values, axisIdx);
        }),
        values: (u, vals) => vals.map(v => { return formatUnit(v, config.panel.plugins.graph.value.units,config.panel.plugins.graph.value.decimal) ?? round(v, config.panel.plugins.graph.value.decimal) }),
        units: config.panel.plugins.graph.value.units,
        side: 3
    }]

    rawData.forEach((d, i) => {
        const override:OverrideItem = config.panel.overrides.find((o) => o.target == d.rawName)
        let opacity = config.panel.plugins.graph.styles.fillOpacity / 100
        const fillOverride =  override?.overrides.find((o) => o.type == "Series.fill")
        if (fillOverride) {
            opacity = fillOverride.value / 100
        }

        let style = config.panel.plugins.graph.styles.style
        let styleOverride = override?.overrides.find((o) => o.type == "Series.style")?.value
        if (styleOverride) {
            style = styleOverride
        }
        
        const unitsOverride = override?.overrides.find((o) => o.type == "Series.unit")?.value
        let scale = 'y'
        if (unitsOverride != undefined) {

            let unitExist = false
            for (const axis of yAxis) {
                if (isEqual(unitsOverride, axis.units)) {
                    unitExist = true
                    scale = axis.scale
                }
            }

            let decimal = config.panel.plugins.graph.value.decimal
            const decimalOverride = override?.overrides.find((o) => o.type == "Series.decimal")?.value
            if (decimalOverride != undefined) {
                decimal = decimalOverride
            }

            if (!unitExist) {
                yAxis.push({
                    grid: {
                        show: config.panel.plugins.graph.axis?.showGrid,
                        width: 0.5,
                        stroke: axesColor
                    },
                    ticks: {
                        size: 4
                    },
                    scale: d.rawName,
                    stroke: textColor,
                    space: axisSpace,
                    size: ((self, values, axisIdx) => {
                        return calculateAxisSize(self, values, axisIdx);
                    }),
                    values: (u, vals) => vals.map(v => { return formatUnit(v, unitsOverride?.units, decimal) ?? round(v, decimal) }),
                    units: unitsOverride,
                    side: 1
                })

                scale = d.rawName
            }


        }
        
        series.push({
            show: inactiveSeries.includes(d.name) ? false : true,
            label:  d.name,
            points: {
                show: (config.panel.plugins.graph.styles.showPoints == "always" || config.panel.plugins.graph.styles?.style == "points") ? true : (config.panel.plugins.graph.styles.showPoints =="auto" ? null :false),
                size: config.panel.plugins.graph.styles?.pointSize,
                stroke: d.color,
                fill: d.color,
                filter:  pointsFilter,
            },
            stroke: d.color,
            width: config.panel.plugins.graph.styles?.style == "points" ? 0 : config.panel.plugins.graph.styles?.lineWidth,
            fill: config.panel.plugins.graph.styles?.style == "points" ? null : (config.panel.plugins.graph.styles?.gradientMode == "none" ? colorManipulator.alpha(d.color ?? '', opacity) : fill(d.color, opacity)),
            spanGaps: config.panel.plugins.graph.styles.connectNulls,
            paths: style == "bars" ? uPlot.paths.bars({
                size: [BarWidthFactor, BardMaxWidth],
                align: 0,
            }) : null,
            scale:  scale,
        })
    })



    return {
        width: config.width,
        height: config.height,
        series: series,
        legend: {
            show: false,
        },
        hooks: {},
        plugins: [
            // tooltipPlugin(config.panel.id),
            // renderStatsPlugin()
        ],
        cursor: {
            lock: true,
            // focus: {
            //     prox: 16,
            // },
            sync: {
                key: config.sync?.key,
                scales: ['x', null as any],
                match: [() => true, () => true],
            },
        },
        tzDate: ts => uPlot.tzDate(new Date(ts * 1e3), 'Asia/Shanghai'),
        scales: {
            x: {
                time: true,
                auto: false,
                dir: 1,
            },
            y: {
                auto: true,
                dir: 1,
                distr: config.panel.plugins.graph.axis?.scale == "linear" ? 1 : 3,
                ori: 1,
                log: config.panel.plugins.graph.axis?.scaleBase,
                // min: 1
            }
        },
        axes: [
            {
                grid: {
                    show: config.panel.plugins.graph.axis?.showGrid,
                    width: 0.5,
                    stroke: axesColor
                },
                scale: 'x',
                labelGap: 0,
                space: axisSpace,
                values: formatTime,
                stroke: textColor,
            },
            ...yAxis
        ]
    }
}



enum ScaleOrientation {
    Horizontal = 0,
    Vertical = 1,
}

const fill = (color: string, opacity: number) => {
    return (plot: uPlot, seriesIdx: number) => {
        if (!isEmpty(plot.bbox)) {
            const gradient = makeDirectionalGradient(
                plot.scales.x!.ori === ScaleOrientation.Horizontal ? GradientDirection.Down : GradientDirection.Left,
                plot.bbox,
                canvasCtx
            );

            gradient.addColorStop(0, colorManipulator.alpha(color, opacity));
            gradient.addColorStop(1, colorManipulator.alpha(color, 0));

            return gradient;
        }
    }
}


export enum GradientDirection {
    Right = 0,
    Up = 1,
    Left = 2,
    Down = 3,
}
function makeDirectionalGradient(direction: GradientDirection, bbox: uPlot.BBox, ctx: CanvasRenderingContext2D) {
    let x0 = 0,
        y0 = 0,
        x1 = 0,
        y1 = 0;

    if (direction === GradientDirection.Down) {
        y0 = bbox.top;
        y1 = bbox.top + bbox.height;
    } else if (direction === GradientDirection.Left) {
        x0 = bbox.left + bbox.width;
        x1 = bbox.left;
    } else if (direction === GradientDirection.Up) {
        y0 = bbox.top + bbox.height;
        y1 = bbox.top;
    } else if (direction === GradientDirection.Right) {
        x0 = bbox.left;
        x1 = bbox.left + bbox.width;
    }

    return ctx.createLinearGradient(x0, y0, x1, y1);
}

const timeUnitSize = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    month: 28 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
};

export function formatTime(
    self: uPlot,
    splits: number[],
    axisIdx: number,
    foundSpace: number,
    foundIncr: number
) {
    const timeZone = (self.axes[axisIdx] as any).timeZone;
    const scale = self.scales.x;
    const range = (scale?.max ?? 0) - (scale?.min ?? 0);
    const yearRoundedToDay = Math.round(timeUnitSize.year / timeUnitSize.day) * timeUnitSize.day;
    const incrementRoundedToDay = Math.round(foundIncr / timeUnitSize.day) * timeUnitSize.day;

    let format = systemDateFormats.interval.year;

    if (foundIncr <= timeUnitSize.minute) {
        format = systemDateFormats.interval.second;
    } else if (range <= timeUnitSize.day) {
        format = systemDateFormats.interval.minute;
    } else if (foundIncr <= timeUnitSize.day) {
        format = systemDateFormats.interval.hour;
    } else if (range < timeUnitSize.year) {
        format = systemDateFormats.interval.day;
    } else if (incrementRoundedToDay === yearRoundedToDay) {
        format = systemDateFormats.interval.year;
    } else if (foundIncr <= timeUnitSize.year) {
        format = systemDateFormats.interval.month;
    }

    return splits.map((v) => dateTimeFormat(v * 1000, { format, timeZone }));
}


export const UPLOT_AXIS_FONT_SIZE = 12;
function calculateAxisSize(self: uPlot, values: string[], axisIdx: number) {
    const axis = self.axes[axisIdx];

    let axisSize = axis.ticks!.size!;
    if (axis.side === 2) {
        axisSize += axis!.gap! + UPLOT_AXIS_FONT_SIZE;
    } else if (values?.length) {
        let maxTextWidth = values.reduce(
            (acc, value) => Math.max(acc, measureText(value, UPLOT_AXIS_FONT_SIZE).width),
            0
        );
        // limit y tick label width to 40% of visualization
        const textWidthWithLimit = Math.min(self.width * 0.4, maxTextWidth);
        // Not sure why this += and not normal assignment
        axisSize += axis!.gap! + axis!.labelGap! + textWidthWithLimit;
    }
    
    return Math.ceil(axisSize + 15);
}


function calculateSpace(self: uPlot, axisIdx: number, scaleMin: number, scaleMax: number, plotDim: number): number {
  
    const axis = self.axes[axisIdx];
    const scale = self.scales[axis.scale!];
    

    const defaultSpacing = axis.scale== 'x' ? 40 : 40;
    // for axis left & right
    if (axis.side !== 2 || !scale) {
        return defaultSpacing;
    }



    if (scale.time) {
        const maxTicks = plotDim / defaultSpacing;
        const increment = (scaleMax - scaleMin) / maxTicks;
        const sample = formatTime(self, [scaleMin], axisIdx, defaultSpacing, increment);
        const width = measureText(sample[0], UPLOT_AXIS_FONT_SIZE).width + 18;
        return width;
    }
    
    return defaultSpacing;
}


export const pointsFilter = (u, seriesIdx, show, gaps) => {
    let filtered = [];

    let series = u.series[seriesIdx];

    if (!show && gaps && gaps.length) {
      const [firstIdx, lastIdx] = series.idxs!;
      const xData = u.data[0];
      const yData = u.data[seriesIdx];
      const firstPos = Math.round(u.valToPos(xData[firstIdx], 'x', true));
      const lastPos = Math.round(u.valToPos(xData[lastIdx], 'x', true));

      if (gaps[0][0] === firstPos) {
        filtered.push(firstIdx);
      }

      // show single points between consecutive gaps that share end/start
      for (let i = 0; i < gaps.length; i++) {
        let thisGap = gaps[i];
        let nextGap = gaps[i + 1];

        if (nextGap && thisGap[1] === nextGap[0]) {
          // approx when data density is > 1pt/px, since gap start/end pixels are rounded
          let approxIdx = u.posToIdx(thisGap[1], true);

          if (yData[approxIdx] == null) {
            // scan left/right alternating to find closest index with non-null value
            for (let j = 1; j < 100; j++) {
              if (yData[approxIdx + j] != null) {
                approxIdx += j;
                break;
              }
              if (yData[approxIdx - j] != null) {
                approxIdx -= j;
                break;
              }
            }
          }

          filtered.push(approxIdx);
        }
      }

      if (gaps[gaps.length - 1][1] === lastPos) {
        filtered.push(lastIdx);
      }
    }

    return filtered.length ? filtered : null;
  }


  