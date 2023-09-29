
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import Panel from "./Gauge";
import { mockGaugeDataForTestDataDs } from "./mockData"
import icon from './gauge.svg'

const panelComponents: PanelPluginComponents = {
    panel: Panel,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockGaugeDataForTestDataDs,
    icon
}

export default  panelComponents