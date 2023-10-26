
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import DatavLogPanel from "./Panel";
import icon from './icon.svg'
import { DatavLogSettings, PanelType } from "./types";
import { mockLogDataForTestDataDs } from "./mocks/mockData";


const panelComponents: PanelPluginComponents = {
    panel: DatavLogPanel,
    editor: PanelEditor,
    mockDataForTestDataDs: mockLogDataForTestDataDs,
    settings: {
        type: PanelType,
        icon,
        initOptions: {
            showChart: true,
            showLogs: true,
            showSearch: true,
            headerFontSize: 12.5,
            logFontSize: 12.5,
            logline: {
                wrapLine: false,
                allowOverflow: false,
            },
            columns: {
                displayColumns: [
                    {key: "timestamp",name:"timestamp", width: [100,170]},
                    {key: "severity",name:"severity", width: [50, 90]},
                    {key: "service",name:"service", width: [150,120]},
                    {key: "body", name:"body", width: [500, 800]},
                ]
            },
            chart: {
                height: 100,
                type: "bar",
                stack: true,
                left: 1,
                right: 3,
                top: 6,
                bottom: 35
            }
        } as DatavLogSettings
    },
}

export default  panelComponents