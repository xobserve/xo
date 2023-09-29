
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import PiePanelWrapper from "./Pie";
import PieOverridesEditor, { PieRules, getPieOverrideTargets } from "./OverridesEditor";
import { mockPieDataForTestDataDs } from "./mockData";

const panelComponents: PanelPluginComponents = {
    panel: PiePanelWrapper,
    editor: PanelEditor,
    overrideEditor: PieOverridesEditor,
    overrideRules: PieRules,
    getOverrideTargets: getPieOverrideTargets,
    mockDataForTestDataDs:  mockPieDataForTestDataDs
}

export default  panelComponents