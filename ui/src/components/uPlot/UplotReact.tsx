// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';

import uPlot from 'uplot';


const UplotReact = ({
    options,
    data,
    target,
    onDelete = () => {},
    onCreate = () => {},
    resetScales = true,
    children
}: {
    options: uPlot.Options;
    data: uPlot.AlignedData;
    // eslint-disable-next-line
    target?: HTMLElement | ((self: uPlot, init: Function) => void);
    onDelete?: (chart: uPlot) => void;
    onCreate?: (chart: uPlot) => void;
    resetScales?: boolean;
    children?:any
}): JSX.Element | null => {
    const chartRef = useRef<uPlot | null>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    console.log("uplot react rendered")
    function destroy(chart: uPlot | null) {
        if (chart) {
            onDelete(chart);
            chart.destroy();
            chartRef.current = null;
        }
    }
    function create() {
        const newChart = new uPlot(options, data, target || (targetRef.current as HTMLDivElement));
        chartRef.current = newChart;
        onCreate(newChart);
    }
    // componentDidMount + componentWillUnmount
    useEffect(() => {
        create();
        return () => {
            destroy(chartRef.current);
        };
    }, []);
    // componentDidUpdate
    const prevProps = useRef({ options, data, target }).current;
    useEffect(() => {
        if (JSON.stringify(prevProps.options) != JSON.stringify(options)) {
            // console.log("here0000")
            const optionsState = optionsUpdateState(prevProps.options, options);
            if (!chartRef.current || optionsState === 'create') {
                // console.log("here00001")
                destroy(chartRef.current);
                create();
            } else if (optionsState === 'update') {
                // console.log("here0002")
                chartRef.current.setSize({ width: options.width, height: options.height });
            }
        } else {
            if (prevProps.data !== data) {
                // console.log("here1111")
                if (!chartRef.current) {
                    create();
                } else  {
                    if (resetScales) {
                        // console.log("here1112")
                        chartRef.current.setData(data, false);
                        chartRef.current.redraw();
                        chartRef.current.setScale('x', {min: data[0][0], max: data[0][data[0].length-1]})
                    } else {
                        // console.log("here1113")
                        chartRef.current.setData(data, false);
                        chartRef.current.redraw();
                    }
                }
            } else {
                if (prevProps.target !== target) {
                    destroy(chartRef.current);
                    create();
                }
            }
        }
        
      

        prevProps.options = options;
        prevProps.data = data;
        prevProps.target = target;
    }, [options, data, target, resetScales]);

    return target ? null : <Box ref={targetRef}>{children}</Box>;
}

export default UplotReact

type OptionsUpdateState = 'keep' | 'update' | 'create';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
if (!Object.is) {
    // eslint-disable-next-line
    Object.defineProperty(Object, "is", {value: (x: any, y: any) =>
        (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y)
    });
}

export const optionsUpdateState = (_lhs: uPlot.Options, _rhs: uPlot.Options): OptionsUpdateState => {
    const {width: lhsWidth, height: lhsHeight, ...lhs} = _lhs;
    const {width: rhsWidth, height: rhsHeight, ...rhs} = _rhs;

    let state: OptionsUpdateState = 'keep';
    if (lhsHeight !== rhsHeight || lhsWidth !== rhsWidth) {
        state = 'update';
    }

    // @todo: 当调整图表大小时，会不停的重建图表
    if (Object.keys(lhs).length !== Object.keys(rhs).length) {
        return 'create';
    }
    for (const k of Object.keys(lhs)) {
        if (!Object.is(lhs[k], rhs[k])) {
            state = 'create';
            break;
        }
    }
    return state;
}

export const dataMatch = (lhs: uPlot.AlignedData, rhs: uPlot.AlignedData): boolean => {
    if (lhs.length !== rhs.length) {
        return false;
    }
    return lhs.every((lhsOneSeries, seriesIdx) => {
        const rhsOneSeries = rhs[seriesIdx];
        if (lhsOneSeries.length !== rhsOneSeries.length) {
            return false;
        }
        return lhsOneSeries.every((value, valueIdx) => value === rhsOneSeries[valueIdx]);
    });
}