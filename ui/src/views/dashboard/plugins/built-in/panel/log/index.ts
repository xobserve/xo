
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import LogPanelWrapper from "./Log";
import { mockLogDataForTestDataDs } from "./mocks/mockData";
import icon from './log.svg'

const panelComponents: PanelPluginComponents = {
    panel: LogPanelWrapper,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockLogDataForTestDataDs,
    icon
}

export default  panelComponents