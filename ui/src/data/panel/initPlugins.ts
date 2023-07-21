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
import { PanelPlugins, PieLegendPlacement, Units, UnitsType } from "types/panel/plugins";
import { ThresholdsConfig, ThresholdsMode } from "types/threshold";
import { ValueCalculationType } from "types/value";
import { colors } from "utils/colors";

export const onClickCommonEvent = `
// setVariable: (varName:string, varValue:string) => void 
// navigate: react-router-dom -> useNavigate() -> navigate 
// setDateTime: (from: Timestamp, to: TimeStamp) => void
function onRowClick(row, navigate, setVariable, setDateTime) {
    console.log(row)
}
`

const initUnits: Units = {
    unitsType: 'none',
    units: [],
}

const initThresholds = ():ThresholdsConfig => {
    return {
        mode: ThresholdsMode.Absolute,
        thresholds: [{
            value: null,
            color: colors[0]
        }]
    }
}

//@needs-update-when-add-new-panel
export const initPanelPlugins: PanelPlugins = {
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
            lineWidth: 2,
            fillOpacity: 21,
            showPoints: "auto",
            pointSize: 6,
            gradientMode: "opacity",
            connectNulls: false
        },
        axis: {
            showGrid: true,
            scale: "linear",
            scaleBase: 2
        },
        value: {
            ...initUnits,
            decimal: 1
        }
    },

    [PanelType.Text]: {
        disableDatasource: true,
        md: `#Welcome to Datav\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!`,
        justifyContent: "left",
        alignItems: "top",
        fontSize: '1.2rem',
        fontWeight: '500',
    },

    [PanelType.Table]: {
        showHeader: true,
        bordered: false,
        cellSize: "middle",
        stickyHeader: false,
        tableWidth: 100,
        column: {
            align: "left",
            enableSort: false,
            enableFilter: false
        },
        globalSearch: false,
        enablePagination: false,

        onRowClick: onClickCommonEvent,
        rowActions: [],
        actionColumnName: null,
        actionClumnWidth: null,
        actionButtonSize: "sm"
    },

    [PanelType.NodeGraph]: {
        node: {
            baseSize: 36,
            maxSize: 1.5,
            icon: [],
            shape: "donut",
            donutColors: JSON.stringify({
                'success': '#61DDAA',
                'error': '#F08BB4',
            }),
            tooltipTrigger: 'mouseenter',
            menu: []
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
                light: '#E0D731',
                dark: '#00B5D8'
            },
            display: true
        },

        legend: {
            enable: true
        },

        layout: {
            nodeStrength: 5000,
            gravity: 60,
        }
    },

    [PanelType.Echarts]: {
        animation: true,
        allowEmptyData: false,
        setOptionsFunc: `// setOptions return echarts.Options, it is directly passed to a echarts chart.
// Find more options examples: https://echarts.apache.org/examples/en/index.html#chart-type-line
function setOptions(data) {
    console.log(data)
    // I guess you are using testdata datasource,
    // data fetching from testdata is already an echarts option
    // so there is no need to parse it
    const options = {...data[0]}
    
    //!!!ATTENTION!!!
    //options returns here must be a new object to trigger react update!
    return options
}`,
        registerEventsFunc: `// In registerEvents, you can custom events on your chart, e.g mouse click event, mouse over event etc.
// chart: a instance of echarts, you can call echarts apis on it
// options: result of setOptions function
// Find more examples: https://echarts.apache.org/en/api.html#events
function registerEvents(options, chart) {
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
            radius: 90,
            innerRadius: 0,
        },
        showLabel: true,
        legend: {
            show: false,
            orient: 'horizontal',
            placement: PieLegendPlacement.Bottom
        },
        value: {
            ...initUnits,
            decimal: 2,
            calc: ValueCalculationType.Last
        },
        onClickEvent: `function onClickEvent(params) {
    console.log(params)
}`
    },
    [PanelType.Gauge]: {
        animation: true,
        value: {
            show: true,
            min: 0,
            max: 100,
            fontSize: 15,
            left: '0%',
            top: '75%',
            unit: '%',
            calc: ValueCalculationType.Last,
            decimal: 1,
        },
        scale: {
            enable: true,
            splitNumber: 3,
            fontSize: 14
        },
        axis: {
            width: 12,
            showTicks: true,
            split: [
                [0.3, '#67e0e3'],
                [0.7, '#37a2da'],
                [1, '#fd666d']
            ]
        },
        title: {
            show: true,
            fontSize: 14,
            left: '0%',
            top: '60%'
        }
    },

    [PanelType.Stat]: {
        showTooltip: true,
        showLegend: false,
        value: {
            ...initUnits,
            decimal: 2,
            calc: ValueCalculationType.Last
        },
        styles: {
            style: "lines",
            fillOpacity: 80,
            gradientMode: "opacity",
            color: colors[0],
            graphHeight: 60,
            connectNulls: false
        },
        axisY: {
            scale: "linear",
            scaleBase: 2
        }
    },

    [PanelType.Trace]: {

    },

    [PanelType.BarGauge]: {
        value: {
            ...initUnits,
            decimal: 1,
            calc: ValueCalculationType.Last
        },
        orientation: "horizontal",
        mode: "basic",
        style: {
            showUnfilled: true,
            titleSize: 18,
            valueSize: 16
        },
        min: null,
        max: null,
        maxminFrom: "all",
        showMax: false,
        thresholds: initThresholds()
    }
}

