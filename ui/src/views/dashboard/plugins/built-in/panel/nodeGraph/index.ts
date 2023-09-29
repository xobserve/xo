
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import NodeGraphPanelWrapper from "./NodeGraph";
import { mockNodeGraphDataForTestDataDs } from "./mocks/mockData";
import icon from './nodegraph.svg'

const panelComponents: PanelPluginComponents = {
    panel: NodeGraphPanelWrapper,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockNodeGraphDataForTestDataDs,
    icon
}

export default  panelComponents