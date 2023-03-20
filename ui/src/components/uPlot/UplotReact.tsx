import { Box } from '@chakra-ui/react';
import { cloneDeep } from 'lodash';
import React, { useEffect, useRef } from 'react';

import uPlot from 'uplot';


export default function UplotReact({
    options,
    data,
    target,
    onDelete = () => {},
    onCreate = () => {},
    resetScales = true,
}: {
    options: uPlot.Options;
    data: uPlot.AlignedData;
    // eslint-disable-next-line
    target?: HTMLElement | ((self: uPlot, init: Function) => void);
    onDelete?: (chart: uPlot) => void;
    onCreate?: (chart: uPlot) => void;
    resetScales?: boolean;
}): JSX.Element | null {
    const chartRef = useRef<uPlot | null>(null);
    const targetRef = useRef<HTMLDivElement>(null);

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
        if (prevProps.options !== options) {
            const optionsState = optionsUpdateState(prevProps.options, options);
            if (!chartRef.current || optionsState === 'create') {
                destroy(chartRef.current);
                create();
            } else if (optionsState === 'update') {
                chartRef.current.setSize({ width: options.width, height: options.height });
            }
        }
        if (prevProps.data !== data) {
            if (!chartRef.current) {
                create();
            } else if (!dataMatch(prevProps.data, data)) {
                if (resetScales) {
                    chartRef.current.setData(data, true);
                } else {
                    chartRef.current.setData(data, false);
                    chartRef.current.redraw();
                }
            }
        }
        if (prevProps.target !== target) {
            destroy(chartRef.current);
            create();
        }

        return () => {
            prevProps.options = options;
            prevProps.data = data;
            prevProps.target = target;
        };
    }, [options, data, target, resetScales]);

    return target ? null : <Box ref={targetRef}></Box>;
}



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