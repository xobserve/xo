import { Panel } from "types/dashboard";
import { PluginSettings } from "./types";
import { cloneDeep } from "lodash";
import { isEmpty } from "utils/validate";
import { formatUnit } from "components/Unit";
import { findOverride, findRuleInOverride } from "utils/dashboard/panel";
import { OverrideRules } from "./OverrideEditor";
import { paletteColorNameToHex } from "utils/colors";
import { FieldType, SeriesData } from "types/seriesData";

export const buildOptions = (panel: Panel, data: SeriesData[], colorMode: "light" | "dark") => {
    const options: PluginSettings = panel.plugins[panel.type]

    const upColor = paletteColorNameToHex(options.kChart.upColor, colorMode)
    const downColor = paletteColorNameToHex(options.kChart.downColor, colorMode)
    
    // Each item: open，close，lowest，highest
    const series = cloneDeep(data[0])
    const kChartName = isEmpty(options.kChart.displayName) ?  (isEmpty(series.name) ? "K" : series.name) : options.kChart.displayName
    const data0 = splitData(transformSeriesDataToCandlestickFormat(series));
    function splitData(rawData) {
        let categoryData = [];
        let values = [];
        let volumes = [];
        for (let i = 0; i < rawData.length; i++) {
            categoryData.push(rawData[i].splice(0, 1)[0]);
            values.push(rawData[i]);
            if (rawData[i][4]) {
            volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);

            }
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

    const solidKChart = false
    const showVolume = options.volumeChart.show && !isEmpty(data0.volumes)
    const volumeGrid = showVolume ? (!options.volumeChart.showYAxisLabel ? [{
        left: '5%',
        right: ((options.mark.minLine != "none" || options.mark.maxLine != "none") ? '6%' : '2%'),
        top: '65%',
        height: '13%'
    }] : [{
        left: '5%',
        top: '65%',
        height: '13%'
    }]): []

    const volumeOverride = findOverride(panel, "Volume")
    const ma5verride = findOverride(panel, "MA5")
    const ma10verride = findOverride(panel, "MA10")
    const ma20verride = findOverride(panel, "MA20")
    const ma30verride = findOverride(panel, "MA30")

    return  {
        animation: options.animation,
        tooltip: [{
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
            position: options.kChart.fixTooltip && function (pos, params, el, elRect, size) {
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
        }],
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
        visualMap: showVolume && [{
            show: false,
            seriesIndex: options.volumeChart.syncColor ? 1 : -1,
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
        !solidKChart && {
            show: false,
            seriesIndex: 0,
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
        }],
        legend: {
            show: true,
            data: [isEmpty(kChartName) ? 'K' : kChartName, findRuleInOverride(ma5verride, OverrideRules.SeriesName) ?? 'MA5', findRuleInOverride(ma10verride, OverrideRules.SeriesName) ?? 'MA10', findRuleInOverride(ma20verride, OverrideRules.SeriesName) ?? 'MA20', findRuleInOverride(ma30verride, OverrideRules.SeriesName) ?? 'MA30']
        },
        grid: [{
            top: '8%',
            left: '5%',
            right: (options.mark.minLine != "none" || options.mark.maxLine != "none") ? '6%' : '2%',
            height: showVolume ? '50%' : null,
            bottom: showVolume ? null : "20%"
        },
        ...volumeGrid
        ],
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
            showVolume && {
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
                show: options.kChart.splitArea
            },
            splitLine: {
                show: options.kChart.splitLine,
            },
            axisLabel: {
                formatter: (function (value) {
                    return formatUnit(value, options.value.units, options.value.decimal)
                }),
            },
        },
        showVolume && {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            position: "right",
            axisLabel: { 
                show: options.volumeChart.showYAxisLabel,
                formatter: (function (value) {
                    return formatUnit(value, options.volumeChart.value.units, options.volumeChart.value.decimal)
                }),
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: options.volumeChart.splitLine }
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
                name: isEmpty(kChartName) ? 'K' : kChartName,
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
            showVolume && {
                name: findRuleInOverride(volumeOverride, OverrideRules.SeriesName) ?? 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: data0.volumes,
                itemStyle: {
                    opacity: options.chartOpacity,
                    color: paletteColorNameToHex(findRuleInOverride(volumeOverride, OverrideRules.SeriesColor),colorMode) ?? null,
                },
                tooltip: {
                    valueFormatter: (function (value) {
                        if (isEmpty(value)) {
                            return value
                        }
                        return formatUnit(value, options.volumeChart.value.units, options.volumeChart.value.decimal)
                    }),
                }
            },
            options.maLine.ma5 && {
                name: findRuleInOverride(ma5verride, OverrideRules.SeriesName) ?? 'MA5',
                type: 'line',
                data: calculateMA(5),
                smooth: true,
                lineStyle: {
                    opacity: 0.5,
                    width: options.maLine.lineWidth
                },
                itemStyle: {
                    color: paletteColorNameToHex(findRuleInOverride(ma5verride, OverrideRules.SeriesColor),colorMode) ?? null,
                },
                symbol: options.maLine.lineSymbol
            },
            options.maLine.ma10 && {
                name: findRuleInOverride(ma10verride, OverrideRules.SeriesName) ?? 'MA10',
                type: 'line',
                data: calculateMA(10),
                smooth: true,
                lineStyle: {
                    opacity: 0.5,
                    width: options.maLine.lineWidth
                },
                itemStyle: {
                    color: paletteColorNameToHex(findRuleInOverride(ma10verride, OverrideRules.SeriesColor),colorMode) ?? null,
                },
                symbol: options.maLine.lineSymbol
            },
            options.maLine.ma20 && {
                name: findRuleInOverride(ma20verride, OverrideRules.SeriesName) ?? 'MA20',
                type: 'line',
                data: calculateMA(20),
                smooth: true,
                lineStyle: {
                    opacity: 0.5,
                    width: options.maLine.lineWidth
                },
                itemStyle: {
                    color: paletteColorNameToHex(findRuleInOverride(ma20verride, OverrideRules.SeriesColor),colorMode) ?? null,
                },
                symbol: options.maLine.lineSymbol
            },
            options.maLine.ma30 && {
                name: findRuleInOverride(ma30verride, OverrideRules.SeriesName) ?? 'MA30',
                type: 'line',
                data: calculateMA(30),
                smooth: true,
                lineStyle: {
                    opacity: 0.5,
                    width: options.maLine.lineWidth
                },
                itemStyle: {
                    color: paletteColorNameToHex(findRuleInOverride(ma30verride, OverrideRules.SeriesColor),colorMode) ?? null,
                },
                symbol: options.maLine.lineSymbol
            }
        ]
    };
}


const transformSeriesDataToCandlestickFormat = (s: SeriesData) => {
    const res = []
    const timeField = s.fields.find(f => f.type == FieldType.Time)
    const openField = s.fields.find(f => f.name == "open")
    const closeField = s.fields.find(f => f.name == "close")
    const lowestField = s.fields.find(f => f.name == "lowest")
    const highestField = s.fields.find(f => f.name == "highest")
    const volumeField = s.fields.find(f => f.name == "volume")

    // [time, open, close, lowest, highest, volume]
    timeField.values.forEach((t,i) => {
        const v = [
            t,
            openField.values[i],
            closeField.values[i],
            lowestField.values[i],
            highestField.values[i],
        ]

        if (volumeField) {
            v.push(volumeField.values[i])
        }

        res.push(v)
    }) 

    return res
}