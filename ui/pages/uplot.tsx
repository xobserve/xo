import UplotReact from 'components/uPlot/UplotReact';
import React, {useMemo, useState} from 'react';
import ReactDOM, {unstable_batchedUpdates} from 'react-dom';
import * as colorManipulator from 'components/uPlot/colorManipulator';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { canvasCtx } from './_app';
import { isEmpty } from 'lodash';
import { Box } from '@chakra-ui/react';

const dummyPlugin = (): uPlot.Plugin => ({
    hooks: {
        init(u: uPlot, opts: uPlot.Options) {void u; void opts;}
    }
});



const HooksApp = () => {
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


    const [options, setOptions] = useState<uPlot.Options>(useMemo(() => ({
        title: 'Chart',
        width: 500,
        height: 300,
        series: [{
            label: 'Date'
        }, {
            label: '',
            points: {show: false},
            stroke: "#F2495C",
            fill: fill,
            width:2,
        }],
        plugins: [dummyPlugin()],
        scales: {x: {time: false}}
    }), []));
    const initialState = useMemo<uPlot.AlignedData>(() =>
        ([[...new Array(100)].map((_, i) => i), [...new Array(100)].map((_, i) => i % 10)])
    , []);
    const [data, setData] = useState<uPlot.AlignedData>(initialState);

    setTimeout(() => {
        const newOptions = {
            ...options,
            title: 'Rendered with hooks'
        };
        const newData: uPlot.AlignedData = [
            [...data[0], data[0].length],
            [...data[1], data[0].length % 1000]
        ];

        unstable_batchedUpdates(() => {
            setData(newData);
            setOptions(newOptions);
        });
    }, 50000);
    return (<UplotReact
        key="hooks-key"
        options={options}
        data={data}
        onDelete={(/* chart: uPlot */) => console.log('Deleted from hooks')}
        onCreate={(/* chart: uPlot */) => console.log('Created from hooks')}
    />);
}

const UplotPage = () => {
    return (
        <Box position="absolute" left="100px" top="100px">
            <HooksApp />
        </Box>
    )
}

export default UplotPage;


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