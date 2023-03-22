import { useColorMode, useColorModeValue } from "@chakra-ui/react";
import { round, isEmpty } from "lodash";
import { useEffect, useState } from "react"
import { ColorMode } from "src/data/constants";
import { renderStatsPlugin } from "./uplot-plugins/render-stats";
import { seriesMediansPlugin } from "./uplot-plugins/series-median";
import * as colorManipulator from 'components/uPlot/colorManipulator';
import { canvasCtx } from 'pages/_app';
import { PanelProps } from "types/dashboard";
import uPlot from "uplot";
import { systemDateFormats } from "utils/datetime/formats";
import { dateTimeFormat } from "utils/datetime/formatter";
import { colors } from "utils/colors";
import customColors from "src/theme/colors";


const dummyPlugin = (): uPlot.Plugin => ({
    hooks: {
        init(u: uPlot, opts: uPlot.Options) { void u; void opts; }
    }
});


// build uplot options based on given config
export const useOptions = (config: PanelProps) => {
    const { colorMode } = useColorMode()
    const [options, setOptions] = useState<uPlot.Options>(null);
    const c =  useColorModeValue(customColors.textColorRGB.light, customColors.textColorRGB.dark)
    useEffect(() => {
        const axesColor = colorMode == ColorMode.Light ? "rgba(0, 10, 23, 0.09)" : "rgba(240, 250, 255, 0.09)"

        // build series
        const series = []
        // push time series option
        series.push({
            label: "Time",

        })

        config.data.forEach((d, i) => {
            // get line color of series 
            const color = colors[i % colors.length]
            series.push({
                show: config.panel.settings.graph.activeSeries ? (config.panel.settings.graph.activeSeries == d.name ? true : false) : true,
                label: d.name,
                points: { show: false },
                stroke: color,
                width: 1,
                fill: fill(color,0.2)
            })

            d.color = color
        })

        // update options
        setOptions({
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
            tzDate: ts => uPlot.tzDate(new Date(ts * 1e3), 'Asia/Shanghai'),
            scales: {
                x: {
                    time: true,
                    auto: false,
                    dir: 1,
                },
                y: {
                    // distr: 3,
                    auto: true,
                    dir: 1,
                    distr: 1,
                    ori: 1,
                    // min: 1
                }
            },
            axes: [
                {
                    grid: {
                        show: true,
                        width: 0.5,
                        stroke: axesColor
                    },
                    scale: 'x',
                    labelGap: 0,
                    values: formatTime,
                    stroke:c,
                },
                {
                    grid: {
                        show: true,
                        width: 0.5,
                        stroke: axesColor
                    },
                    stroke: c
                },
            ]
        })
    }, [colorMode,config])

    return options
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