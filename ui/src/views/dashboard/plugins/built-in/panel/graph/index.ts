
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import GraphOverridesEditor, { GraphRules, getGraphOverrideTargets } from "./OverridesEditor";
import GraphPanelWrapper from "./Graph";
import { mockGraphDataForTestDataDs } from "./mockData";

const panelComponents: PanelPluginComponents = {
    panel: GraphPanelWrapper,
    editor: PanelEditor,
    overrideEditor: GraphOverridesEditor,
    overrideRules: GraphRules,
    getOverrideTargets: getGraphOverrideTargets,
    mockDataForTestDataDs:  mockGraphDataForTestDataDs
}

export default  panelComponents