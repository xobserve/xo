
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import BarPanelWrapper from "./Bar";
import BarOverridesEditor, { BarRules, getBarOverrideTargets } from "./OverridesEditor";
import { mockBarDataForTestDataDs } from "./mockData";


const panelComponents: PanelPluginComponents = {
    panel: BarPanelWrapper,
    editor: PanelEditor,
    overrideEditor: BarOverridesEditor,
    overrideRules: BarRules,
    getOverrideTargets: getBarOverrideTargets,
    mockDataForTestDataDs:  mockBarDataForTestDataDs
}

export default  panelComponents