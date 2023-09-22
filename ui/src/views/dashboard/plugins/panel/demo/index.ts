import { PanelPluginComponents } from "types/plugins/plugin";
import DemoPanel from "./Demo";
import DemoPanelEditor from "./Editor";
import OverrideEditor, { OverrideRules, getOverrideTargets } from "./OverrideEditor";

const demoComponents: PanelPluginComponents = {
    panel: DemoPanel,
    editor: DemoPanelEditor,
    overrideEditor: OverrideEditor,
    overrideRules: OverrideRules,
    getOverrideTargets: getOverrideTargets
}

export default  demoComponents