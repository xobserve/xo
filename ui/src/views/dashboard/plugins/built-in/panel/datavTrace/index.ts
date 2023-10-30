
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import TracePanelWrapper from "./Trace";
import { mockTraceDataForTestDataDs } from "./mocks/mockData";
import icon from './icon.svg'
import { PanelType } from "./types";


const panelComponents: PanelPluginComponents = {
    panel: TracePanelWrapper,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockTraceDataForTestDataDs,
    settings: {
        type: PanelType,
        icon,
        initOptions: {
            defaultService: "",
            enableEditService: true,
            interaction: {
                enable: false,
                actions: []
            },
            chart: {
                height: 100,
                type: "line",
                stack: true,
                left: 1,
                right: 3,
                top: 6,
                bottom: 15
            }
        },
        disableAutoQuery: true,
    }
}

export default  panelComponents