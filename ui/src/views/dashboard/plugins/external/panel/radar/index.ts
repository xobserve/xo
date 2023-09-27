import { PanelPluginComponents } from "types/plugins/plugin";
import PanelComponent, { mockDataForTestDataDs } from "./Panel";
import PanelEditor from "./Editor";
import OverrideEditor, { OverrideRules, getOverrideTargets } from "./OverrideEditor";


const panelComponents: PanelPluginComponents = {
    panel: PanelComponent,
    editor: PanelEditor,
    overrideEditor: OverrideEditor,
    overrideRules: OverrideRules,
    getOverrideTargets: getOverrideTargets,
    mockDataForTestDataDs: mockDataForTestDataDs
}

export default  panelComponents