import { Panel } from "types/dashboard";
import { PluginSettings } from "./types";
import { cloneDeep } from "lodash";
import { isEmpty } from "utils/validate";
import { formatUnit } from "components/Unit";

export const buildOptions = (panel: Panel, data: any, colorMode: "light" | "dark") => {
    const options: PluginSettings = panel.plugins[panel.type]

    const upColor = '#00da3c';
    const downColor = '#ec0000';
    // Each item: open，close，lowest，highest
    const data0 = splitData(cloneDeep(data.flat()));
    function splitData(rawData) {
        let categoryData = [];
        let values = [];
        let volumes = [];
        for (let i = 0; i < rawData.length; i++) {
            categoryData.push(rawData[i].splice(0, 1)[0]);
            values.push(rawData[i]);
            volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
        }
        return {
            categoryData: categoryData,
            values: values,
            volumes: volumes
        };
    }
    function calculateMA(dayCount) {
        var result = [];
        for (var i = 0, len = data0.values.length; i < len; i++) {
            if (i < dayCount) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for (var j = 0; j < dayCount; j++) {
                sum += +data0.values[i - j][1];
            }
            result.push(sum / dayCount);
        }
        return result;
    }
    const markPoint = []
    if (options.mark.maxPoint != "none") {
        markPoint.push({
            name: 'highest value',
            type: 'max',
            valueDim: options.mark.maxPoint,
            show: false,
        })
    }
    if (options.mark.minPoint != "none") {
        markPoint.push({
            name: 'lowest value',
            type: 'min',
            valueDim: options.mark.minPoint,
        })
    }
    const markLine = []
    if (options.mark.minLine != "none") {
        markLine.push({
            name: 'min line',
            type: 'min',
            valueDim: options.mark.minLine
        })
    }

    if (options.mark.maxLine != "none") {
        markLine.push({
            name: 'max line',
            type: 'max',
            valueDim: options.mark.maxLine
        })
    }

    return  {
        animation: options.animation,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
                const obj = {
                    top: 10
                };
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            },
            valueFormatter: (function (value) {
                if (isEmpty(value)) {
                    return value
                }
                return formatUnit(value, options.value.units, options.value.decimal)
            }),
            // extraCssText: 'width: 170px'
        },
        axisPointer: {
            link: [
                {
                    xAxisIndex: 'all'
                }
            ],
            label: {
                backgroundColor: '#777'
            }
        },
        brush: {
            xAxisIndex: 'all',
            brushLink: 'all',
            outOfBrush: {
                colorAlpha: 0.1
            }
        },
        visualMap: {
            show: false,
            seriesIndex: -1,
            dimension: 2,
            pieces: [
                {
                    value: 1,
                    color: downColor
                },
                {
                    value: -1,
                    color: upColor
                }
            ]
        },
        legend: {
            show: true,
            data: ['K', 'MA5', 'MA10', 'MA20', 'MA30']
        },
        grid: [{
            top: '8%',
            left: '5%',
            right: (options.mark.minLine != "none" || options.mark.maxLine != "none") ? '6%' : '2%',
            height: '50%',
        },
        {
            left: '5%',
            right: (options.mark.minLine != "none" || options.mark.maxLine != "none") ? '6%' : '2%',
            top: '65%',
            height: '13%'
        }],
        xAxis: [
            {
                type: 'category',
                data: data0.categoryData,
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: { show: false },
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100
                }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: data0.categoryData,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                min: 'dataMin',
                max: 'dataMax'
            }
        ],
        yAxis: [{
            scale: true,
            splitArea: {
                show: true
            },
            axisLabel: {
                formatter: (function (value) {
                    return formatUnit(value, options.value.units, options.value.decimal)
                }),
            },
        },
        {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
        }
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 0,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                xAxisIndex: [0, 1],
                top: '90%',
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: 'K',
                type: 'candlestick',
                data: data0.values,
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: undefined,
                    borderColor0: undefined,
                    opacity: options.chartOpacity,
                },
                markPoint: {
                    label: {
                        formatter: function (param) {
                            const v = param != null ? param.value : ''
                            return formatUnit(v, options.value.units, options.value.decimal);
                        },
                        fontSize: "10"
                    },
                    data: markPoint,

                },
                markLine: {
                    symbol: ['none', 'none'],
                    label: {
                        formatter: function (param) {
                            const v = param != null ? param.value : ''
                            return formatUnit(v, options.value.units, options.value.decimal);
                        },
                        // fontSize: "10"
                    },
                    data: [
                        ...markLine
                    ]
                }
            },
            {
                name: 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: data0.volumes,
                itemStyle: {
                    opacity: options.chartOpacity
                },
            },
            options.maLine.ma5 && {
                name: 'MA5',
                type: 'line',
                data: calculateMA(5),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
            options.maLine.ma10 && {
                name: 'MA10',
                type: 'line',
                data: calculateMA(10),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
            options.maLine.ma20 && {
                name: 'MA20',
                type: 'line',
                data: calculateMA(20),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
            options.maLine.ma30 && {
                name: 'MA30',
                type: 'line',
                data: calculateMA(30),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            }
        ]
    };
}