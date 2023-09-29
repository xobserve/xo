
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import StatPanel from "./Stat";
import StatOverridesEditor, { StatRules, getStatOverrideTargets } from "./OverridesEditor";
import { mockStatDataForTestDataDs } from "./mockData";
import icon from './stat.svg'


const panelComponents: PanelPluginComponents = {
    panel: StatPanel,
    editor: PanelEditor,
    overrideEditor: StatOverridesEditor,
    overrideRules: StatRules,
    getOverrideTargets: getStatOverrideTargets,
    mockDataForTestDataDs:  mockStatDataForTestDataDs,
    icon
}

export default  panelComponents