
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import EchartsPanel from "./Echarts";
import { mockEchartsDataForTestDataDs } from "./mockData";

const panelComponents: PanelPluginComponents = {
    panel: EchartsPanel,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockEchartsDataForTestDataDs
}

export default  panelComponents