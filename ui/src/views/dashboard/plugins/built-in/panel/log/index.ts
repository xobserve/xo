
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import LogPanelWrapper from "./Log";
import { mockLogDataForTestDataDs } from "./mocks/mockData";

const panelComponents: PanelPluginComponents = {
    panel: LogPanelWrapper,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockLogDataForTestDataDs
}

export default  panelComponents