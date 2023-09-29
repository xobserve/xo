
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import BarGaugePanel from "./BarGauge";
import BarGaugeOverridesEditor, { getBarguageOverrideTargets } from "./OverrideEditor";
import { BarRules } from "../bar/OverridesEditor";
import { mockBarGaugeDataForTestDataDs } from "./mockData";


const panelComponents: PanelPluginComponents = {
    panel: BarGaugePanel,
    editor: PanelEditor,
    overrideEditor: BarGaugeOverridesEditor,
    overrideRules: BarRules,
    getOverrideTargets: getBarguageOverrideTargets,
    mockDataForTestDataDs:  mockBarGaugeDataForTestDataDs
}

export default  panelComponents