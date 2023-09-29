
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import Panel from "./Gauge";
import { mockGaugeDataForTestDataDs } from "./mockData"

const panelComponents: PanelPluginComponents = {
    panel: Panel,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockGaugeDataForTestDataDs
}

export default  panelComponents