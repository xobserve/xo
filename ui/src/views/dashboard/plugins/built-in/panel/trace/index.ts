
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import TracePanelWrapper from "./Trace";
import { mockTraceDataForTestDataDs } from "./mocks/mockData";
import icon from './trace.svg'


const panelComponents: PanelPluginComponents = {
    panel: TracePanelWrapper,
    editor: PanelEditor,
    mockDataForTestDataDs:  mockTraceDataForTestDataDs,
    icon
}

export default  panelComponents