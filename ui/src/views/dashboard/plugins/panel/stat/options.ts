import { isEmpty } from "lodash";
import * as colorManipulator from 'components/uPlot/colorManipulator';
import { canvasCtx } from 'pages/_app';
import { PanelProps } from "types/dashboard";
import uPlot from "uplot";
import { GraphPluginData } from "types/plugins/graph";




const BarWidthFactor = 0.6
const BardMaxWidth = 200
// build uplot options based on given config
export const parseOptions = (config: PanelProps,rawData: GraphPluginData) => {
    // build series
    const series = []
    // push time series option
    series.push({
        label: "Time",

    })

    rawData.forEach((d, i) => {
        series.push({
            show: true,
            label: d.name,
            stroke: d.color,
            width: 1,
            fill:  fill(d.color,0.9),
            points: {
                show: false,
            },
            spanGaps: false,
            paths: config.panel.plugins.stat.styles?.style == "bars" ? uPlot.paths.bars({
                size: [BarWidthFactor, BardMaxWidth],
                align: 0,
            }) : null
        })
    })


    return {
        width: config.width,
        height: config.height * 0.6,
        series: series,
        hooks: {},
        plugins: [],
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
            y: {
                // distr: 3,
                auto: true,
                dir: 1,
                distr: 3,
                ori: 1,
                log: 2,
                // min: 1
            }
        },
        axes: [
            {
                grid: {
                    show:false,
                },
                scale: 'x',
                show: false,
            },
            {
                grid: {
                    show: false,
                },
                show: false,
                scale: 'y',
            },
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
