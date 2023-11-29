// Copyright 2023 xObserve.io Team

import { thresholdTransform } from 'src/views/dashboard/plugins/components/Threshold/ThresholdEditor'
import { Units } from 'types/panel/plugins'
import { ThresholdsConfig, ThresholdsMode } from 'types/threshold'
import { getDefaultPanelColor } from 'utils/colors'

export const onClickCommonEvent = `
// setVariable: (varName:string, varValue:string) => void 
// navigate: react-router-dom -> useNavigate() -> navigate 
// setDateTime: (from: Timestamp, to: TimeStamp) => void
function onRowClick(row, navigate, setVariable, setDateTime, $variables) {
    // You can get all current variables in this way
    // const currentVariables = $variables.get()
    // console.log(row, currentVariables)
}
`

export const getInitUnits = (): Units => {
  return {
    unitsType: 'none',
    units: [],
  }
}

export const initThresholds = (colorIndex?): ThresholdsConfig => {
  const defaultColor = getDefaultPanelColor()
  return {
    mode: ThresholdsMode.Absolute,
    thresholds: [
      {
        value: null,
        color: defaultColor,
      },
    ],
    transform: thresholdTransform,
    enableTransform: false,
  }
}

export const initAlertFilter = () => {
  return {
    enableFilter: true,
    state: [],
    datasources: [],
    httpQuery: {
      id: 65,
      metrics: '',
      legend: '',
      data: {},
      visible: true,
    },
    ruleLabel: '',
    alertLabel: '',
    ruleName: '',
  }
}
export const setEchartsOptions = `
// setOptions return echarts.Options, it is directly passed to a echarts chart.
// Find more options examples: https://echarts.apache.org/examples/en/index.html#chart-type-line
// data: SeriesData[] which is the standard data format in xobserve
// thresholds: ThresholdsConfig[] | null
// colors: color palettes using in xobserve
// echarts: imported echarts.js module 
// lodash: imported lodash.js module
// moment: imported momen.jst module
// colorMode: "light" | "dark"
function setOptions(data, thresholds, colors, echarts, lodash, moment, colorMode, units) {
    const colorList = [
        ['rgb(128, 255, 165)', 'rgb(1, 191, 236)'],
        ['rgb(0, 221, 255)', 'rgb(77, 119, 255)'],
        ['rgb(55, 162, 255)', 'rgb(1, 191, 236)'],
        ['rgb(255, 0, 135)', 'rgb(135, 0, 157)'],
        ['rgb(255, 191, 0)', 'rgb(224, 62, 76)'],
    ]

    const legend = []
    const seriesList = []
    if (!echarts) {
        return null
    }

    for (let i = 0; i < data.length; i++) {
        const s = data[i]
        legend.push(s.name)
        seriesList.push({
            name: s.name,
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
                width: 0
            },
            showSymbol: false,
            areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: colorList[i] ? colorList[i][0] : colors[i % colors.length]
                    },
                    {
                        offset: 1,
                        color: colorList[i] ? colorList[i][1] : colors[i + 1 % colors.length]
                    }
                ])
            },
            emphasis: {
                focus: 'series'
            },
            data: lodash.zip( 
                s.fields.find(f => f.type =="time").values.map(v => v * 1000), 
                s.fields.find(f => f.type == "number").values
            )
        })
    }

    //!!!ATTENTION!!!
    // We need to create a new options Object to return,
    // because only a new object can trigger react update!
    return {
        color: colorList.map(item => item[0]),
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985',
                }
            },
            valueFormatter: (function (value) {
                return units.formatUnit(value, units.units, units.decimal)
            }),
        },
        legend: {
            show: true,
            data: legend
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '5%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'time',
                boundaryGap: false,
                axisLabel: {
                    formatter: (function (value) {
                        return moment(value).format('MM-DD HH:mm:ss');
                    }),
                },
                splitNumber: 5,
            }
        ],
        yAxis: [
            {
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter: (function (value) {
                        return units.formatUnit(value, units.units, units.decimal)
                    }),
                },
            }
        ],
        series: seriesList
    }
}
`
