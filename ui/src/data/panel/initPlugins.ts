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
import { PanelType } from "types/dashboard";
import { LayoutOrientation } from "types/layout";
import { PanelPlugins, PieLegendPlacement, ThresholdDisplay, Units, UnitsType } from "types/panel/plugins";
import { BarThresholdArrow } from "types/plugins/bar";
import { ArcGisMapServer, BaseLayerType, DataLayerType } from "types/plugins/geoMap";
import { ThresholdsConfig, ThresholdsMode } from "types/threshold";
import { ValueCalculationType } from "types/value";
import { palettes } from "utils/colors";


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

const initThresholds = (colorIndex?): ThresholdsConfig => {
    return {
        mode: ThresholdsMode.Absolute,
        thresholds: [{
            value: null,
            color: palettes[colorIndex ?? 0]
        }]
    }
}

//@needs-update-when-add-new-panel
export const initPanelPlugins = (): PanelPlugins => {
    return {
        [PanelType.Graph]: {
            tooltip: {
                mode: 'all',
                sort: 'desc'
            },
            legend: {
                mode: "table",
                placement: "bottom",
                valueCalcs: [ValueCalculationType.Last],
                width: 500,
                nameWidth: '400',
                order: {
                    by: ValueCalculationType.Last,
                    sort: 'desc'
                }
            },
            styles: {
                style: "lines",
                lineWidth: 1,
                fillOpacity: 80,
                showPoints: "auto",
                pointSize: 6,
                gradientMode: "opacity",
                connectNulls: false,
                barRadius: 0,
                barGap: 10,
                enableStack: false
            },
            axis: {
                showGrid: true,
                scale: "linear",
                scaleBase: 2
            },
            value: {
                ...getInitUnits(),
                decimal: 3
            },
            thresholds: initThresholds(),
            thresholdsDisplay: ThresholdDisplay.None,
            enableAlert: false,
            alertFilter: initAlertFilter(),
            clickActions: []
        },

        [PanelType.Text]: {
            disableDatasource: true,
            md: `#Welcome to Datav\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!`,
            justifyContent: "left",
            alignItems: "top",
            fontSize: '1.2em',
            fontWeight: '500',
        },

        [PanelType.Table]: {
            showHeader: true,
            bordered: false,
            cellSize: "middle",
            stickyHeader: false,
            tableWidth: 100,
            column: {
                colorTitle: true,
                align: "left",
                enableSort: false,
                enableFilter: false
            },
            globalSearch: false,
            enablePagination: false,

            enableRowClick: true,
            onRowClick: onClickCommonEvent,
            rowActions: [],
            actionColumnName: null,
            actionClumnWidth: null,
            actionButtonSize: "sm"
        },

        [PanelType.NodeGraph]: {
            zoomCanvas: false,
            scrollCanvas: false,
            dragNode: true,
            dragCanvas: true,
            node: {
                baseSize: 60,
                maxSize: 1.4,
                icon: [],
                shape: "donut",
                donutColors: [
                    { attr: 'success', color: palettes[0] },
                    { attr: 'error', color: palettes[9] }
                ],
                borderColor: palettes[0],
                tooltipTrigger: 'mouseenter',
                menu: [],
                enableHighlight: false,
                highlightNodes: '',
                highlightNodesByFunc:
                    `// data: {nodes, edges}
// return nodes name list, e.g ['node-1', 'node-2']
function highlightNodes(data, lodash) {
    console.log("here3333", data)
    const matchingNodeNames = []
    return matchingNodeNames
}
`,
                highlightColor: palettes[27]
            },

            edge: {
                shape: 'line', // quadratic
                arrow: 'default',
                color: {
                    light: '#ddd',
                    dark: "#8CA88C",
                },
                opacity: 0.6,
                highlightColor: {
                    light: '#C8F2C2',
                    dark: '#00B5D8'
                },
                display: true
            },

            legend: {
                enable: true
            },

            layout: {
                nodeStrength: 5000,
                gravity: 40,
            }
        },

        [PanelType.Echarts]: {
            animation: true,
            allowEmptyData: false,
            setOptionsFunc: setEchartsOptions,
            thresholds: initThresholds(),
            enableThresholds: true,
            enableClick: true,
            registerEventsFunc: `// In registerEvents, you can custom events on your chart, e.g mouse click event, mouse over event etc.
// chart: a instance of echarts, you can call echarts apis on it
// options: result of setOptions function
// Find more examples: https://echarts.apache.org/en/api.html#events
function registerEvents(options, chart, navigate, setVariable, setDateTime, $variables) {
    // !!!!!!!ATTENTION! You must unbind event handler first! 
    // Because each time the options changeds registerEvents function will be called once
    // If we don't unbind event, next time you click the chart will trigger N  click event ( N = Number of times the options changes)
    // Rather than unbind all 'click' events, you can also unbind an specific handler: https://echarts.apache.org/en/api.html#echartsInstance.off
    chart.off('click') 
    chart.on('click', function (params) {
        console.log(params)
    })
}`
        },
        [PanelType.Pie]: {
            animation: true,
            shape: {
                type: 'normal',
                borderRadius: 8,
                radius: 80,
                innerRadius: 0,
            },
            label: {
                show: true,
                align: "none",
                margin: 5,
                showValue: false,
                showName: true,
                fontSize: 12,
                lineHeight: 16,
                transformName:
                    `function transformName(rawName, params) {
    return rawName
}`
            },
            legend: {
                show: false,
                orient: 'horizontal',
                placement: PieLegendPlacement.Bottom
            },
            top: "50%",
            left: "50%",
            value: {
                ...getInitUnits(),
                decimal: 3,
                calc: ValueCalculationType.Last
            },
            thresholds: initThresholds(12),
            enableThresholds: false,
            showThreshodBorder: true,
            enableClick: true,
            onClickEvent: onClickCommonEvent
        },
        [PanelType.Gauge]: {
            animation: true,
            diisplaySeries: null,
            value: {
                show: true,
                min: 0,
                max: 100,
                fontSize: 15,
                left: '0%',
                top: '75%',
                unit: '%',
                calc: ValueCalculationType.Last,
                decimal: 2,
            },
            scale: {
                enable: true,
                splitNumber: 2,
                fontSize: 14
            },
            axis: {
                width: 25,
                showTicks: true,
            },
            title: {
                show: false,
                display: null,
                fontSize: 14,
                left: '0%',
                top: '60%'
            },
            pointer: {
                length: '80%',
                width: 8,
            },
            thresholds: initThresholds(6)
        },

        [PanelType.Stat]: {
            showTooltip: true,
            showGraph: true,
            displaySeries: null,
            showLegend: false,
            value: {
                ...getInitUnits(),
                decimal: 3,
                calc: ValueCalculationType.Last
            },
            styles: {
                colorMode: "value",
                layout: LayoutOrientation.Auto,
                style: "lines",
                fillOpacity: 80,
                graphHeight: 60,
                connectNulls: false,
                hideGraphHeight: 70,
                textAlign: "center",
                showPoints: false
            },
            textSize: {
                value: null,
                legend: null
            },
            axisY: {
                scale: "linear",
                scaleBase: 2
            },
            enableClick: true,
            clickAction: onClickCommonEvent,
            thresholds: initThresholds()
        },

        [PanelType.Trace]: {
            defaultService: "",
            enableEditService: true
        },

        [PanelType.BarGauge]: {
            value: {
                ...getInitUnits(),
                decimal: 2,
                calc: ValueCalculationType.Last
            },
            orientation: "vertical",
            mode: "basic",
            style: {
                showUnfilled: true,
                titleSize: 16,
                valueSize: 14
            },
            min: null,
            max: null,
            maxminFrom: "all",
            showMax: true,
            showMin: true,
            enableClick: true,
            clickAction: onClickCommonEvent,
            thresholds: initThresholds(6)
        },
        [PanelType.GeoMap]: {
            initialView: {
                center: [0, 0],
                zoom: 2,
            },
            baseMap: {
                layer: BaseLayerType.ArcGis,
                mapServer: ArcGisMapServer.WorldStreet,
                url: null,
                attr: null
            },
            dataLayer: {
                layer: DataLayerType.Markers,
                opacity: 0.6
            },
            controls: {
                enableZoom: true,
                showZoom: true,
                showAttribution: true,
                showScale: true,
                showDebug: false,
                showMeasure: false,
                showTooltip: true
            },
            value: {
                ...getInitUnits(),
                decimal: 1,
                calc: ValueCalculationType.Last
            },
            sizeScale: {
                enable: true,
                baseSize: 10,
                maxScale: 4
            },
            enableClick: true,
            onClickEvent: `
// map:  openlayer map <https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html>
// setVariable: (varName:string, varValue:string) => void 
// navigate: react-router-dom -> useNavigate() -> navigate 
// setDateTime: (from: Timestamp, to: TimeStamp) => void

function onClick(data, map, navigate, setVariable, setDateTime, $variables) {
    // You can get all current variables in this way
    const coords = data[0].getGeometry().flatCoordinates
    const view = map.getView()
    view.setCenter(coords)
    view.setZoom(10)
}
`,
            thresholds: initThresholds(12)
        },
        [PanelType.Log]: {
            showTime: true,
            timeColumnWidth: 160,
            orderBy: "newest",
            timeStampPrecision: "ms",
            labels: {
                display: [],
                width: 240,
                layout: LayoutOrientation.Horizontal
            },
            styles: {
                labelColorSyncChart: true,
                labelColor: 'inherit',
                labelValueColor: 'inherit',
                contentColor: 'inherit',
                fontSize: "0.9rem",
                wordBreak: "break-all",
                showlineBorder: true
            },
            toolbar: {
                show: true,
                width: 200,
            },
            chart: {
                show: true,
                height: '120px',
                showLabel: "auto",
                stack: "auto",
                tooltip: "all"
            },
            thresholds: [{ type: null, value: null, key: null, color: 'inherit' }]
        },
        [PanelType.Bar]: {
            animation: true,
            showGrid: true,
            tooltip: "all",
            showLabel: "auto",
            stack: "auto",
            axis: {
                swap: false,
                scale: "linear",
                scaleBase: 2,
            },
            styles: {
                barWidth: 85,
                axisFontSize: 11,
                labelFontSize: 11,
                barOpacity: 80,
            },
            value: {
                ...getInitUnits(),
                decimal: 2,
            },
            legend: {
                show: true,
                placement: "bottom",
                valueCalcs: [ValueCalculationType.Last],
                width: 500,
                nameWidth: '400',
                order: {
                    by: ValueCalculationType.Last,
                    sort: 'desc'
                }
            },
            enableClick: true,
            onClickEvent: onClickCommonEvent,
            thresholds: initThresholds(12),
            thresholdsDisplay: ThresholdDisplay.None,
            thresholdArrow: BarThresholdArrow.None,
        },
        [PanelType.Alert]: {
            viewMode: "list",
            stat: {
                showGraph: true,
                color: "$orange",
                layout: LayoutOrientation.Vertical,
                colorMode: "bg-gradient",
                style: "bars",
                statName: "Alerts"
            },
            disableDatasource: true,
            orderBy: "newest",
            toolbar: {
                show: true,
                width: 200
            },
            chart: {
                show: true,
                height: '120px',
                stack: "auto",
                showLabel: "auto",
                tooltip: "single",
            },
            filter: initAlertFilter(),
            clickActions: []
        }
    }
}


const initAlertFilter = () => {
    return {
        enableFilter: true,
        state: [],
        datasources: [],
        httpQuery: {
            id: 65,
            metrics: '',
            legend: '',
            data: {},
            visible: true
        },
        ruleLabel: '',
        alertLabel: '',
        ruleName: '',
    }
}
export const setEchartsOptions = `
// setOptions return echarts.Options, it is directly passed to a echarts chart.
// Find more options examples: https://echarts.apache.org/examples/en/index.html#chart-type-line
// data: SeriesData[] which is the standard data format in Datav
// thresholds: ThresholdsConfig[] | null
// colors: color palettes using in Datav
// echarts: imported echarts.js module 
// loadash: imported loadash.js module
// moment: imported momen.jst module
// colorMode: "light" | "dark"
function setOptions(data, thresholds, colors, echarts, loadash, moment, colorMode) {
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
            data: loadash.zip(...s.fields.map(f => {
                if (f.type == "time") {
                    return f.values.map(v => v * 1000)
                } else {
                    return f.values
                }
            }))
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
                }
            }
        ],
        series: seriesList
    }
}

`