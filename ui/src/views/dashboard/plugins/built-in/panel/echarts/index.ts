
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import EchartsPanel from "./Echarts";
import { mockEchartsDataForTestDataDs } from "./mockData";
import icon from './echarts.svg'

const panelComponents: PanelPluginComponents = {
    panel: EchartsPanel,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockEchartsDataForTestDataDs,
    icon
}

export default  panelComponents