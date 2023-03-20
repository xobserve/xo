import {unstable_batchedUpdates} from 'react-dom';
import UplotReact from "components/uPlot/UplotReact"
import { useEffect, useMemo, useState } from "react"
import { Panel, PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"
import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react';
import 'uplot/dist/uPlot.min.css';
import { useTheme } from '@emotion/react';
import { cloneDeep, isEmpty, round } from 'lodash';
import {ColorMode} from 'src/data/constants'
import { canvasCtx } from 'pages/_app';
import * as colorManipulator from 'components/uPlot/colorManipulator';

const dummyPlugin = (): uPlot.Plugin => ({
    hooks: {
        init(u: uPlot, opts: uPlot.Options) { void u; void opts; }
    }
});


enum ScaleOrientation {
    Horizontal = 0,
    Vertical = 1,
}

const GraphPanel = (props: PanelProps) => {
    const {colorMode} = useColorMode()
    const [options, setOptions] = useState<uPlot.Options>(null);
    
    useEffect(() => {
        const axesColor = colorMode == ColorMode.Light ? "rgba(0, 10, 23, 0.09)" : "rgba(240, 250, 255, 0.09)"
        console.log(axesColor)
        const axesSpace = round(props.height / 5)
        setOptions({
            width: props.width ,
            height: props.height,
            series: [{
                label: 'Date'
            }, {
                label: '',
                points: { show: false },
                stroke: "#F2495C",
                width: 1,
                fill: fill
            }],
            legend:{
                show: false,
            },
            plugins: [dummyPlugin()],
            scales: { 
                x: { time: false },
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
                    }
                },
                {
                    grid: {
                        show: true,
                        width: 0.5,
                        stroke: axesColor
                    },
                    
                },
            ]
        })
    },[colorMode])
    const initialState = useMemo<uPlot.AlignedData>(() =>
        ([[...new Array(100)].map((_, i) => i), [...new Array(100)].map((_, i) => i % 20)])
        , []);
    const [data, setData] = useState<uPlot.AlignedData>(initialState);

    // setTimeout(() => {
    //     const newOptions = {
    //         ...options,
    //         title: 'Rendered with hooks'
    //     };
    //     const newData: uPlot.AlignedData = [
    //         [...data[0], data[0].length],
    //         [...data[1], data[0].length % 1000]
    //     ];

    //     unstable_batchedUpdates(() => {
    //         setData(newData);
    //         setOptions(newOptions);
    //     });
    // }, 1000);

    // console.log(props)
    return (<>
        {options && <UplotReact
            key="graph-uplot"
            options={options}
            data={data}
            onDelete={(/* chart: uPlot */) => console.log('Deleted from hooks')}
            onCreate={(/* chart: uPlot */) => console.log('Created from hooks')}
        />}
    </>)
}

export default GraphPanel


const fill = (plot: uPlot, seriesIdx: number) => {
    if (!isEmpty(plot.bbox)) {
        const gradient = makeDirectionalGradient(
            plot.scales.x!.ori === ScaleOrientation.Horizontal ? GradientDirection.Down : GradientDirection.Left,
              plot.bbox,
            canvasCtx
          );
      
          gradient.addColorStop(0, colorManipulator.alpha('#F2495C', 0.21));
          gradient.addColorStop(1, colorManipulator.alpha('#F2495C', 0));
      
          return gradient;
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