
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import EchartsPanel from "./Echarts";
import { mockEchartsDataForTestDataDs } from "./mockData";
import icon from './icon.svg'
import { initThresholds, getInitUnits, setEchartsOptions } from "src/data/panel/initPlugins";
import { PanelTypeEcharts } from "./types";

const panelComponents: PanelPluginComponents = {
    panel: EchartsPanel,
    editor: PanelEditor,
    mockDataForTestDataDs: mockEchartsDataForTestDataDs,
    settings: {
        type: PanelTypeEcharts,
        icon,
        initOptions: {
            animation: true,
            allowEmptyData: false,
            setOptionsFunc: setEchartsOptions,
            thresholds: initThresholds(),
            enableThresholds: true,
            enableClick: true,
            value: {
                ...getInitUnits(),
                decimal: 3
            },
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
    }
}

export default panelComponents