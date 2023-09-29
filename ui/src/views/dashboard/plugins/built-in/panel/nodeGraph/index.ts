
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import NodeGraphPanelWrapper from "./NodeGraph";
import { mockNodeGraphDataForTestDataDs } from "./mocks/mockData";

const panelComponents: PanelPluginComponents = {
    panel: NodeGraphPanelWrapper,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockNodeGraphDataForTestDataDs
}

export default  panelComponents