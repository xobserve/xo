
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import BarGaugePanel from "./BarGauge";
import BarGaugeOverridesEditor, { BarGaugeRules, getBarguageOverrideTargets } from "./OverrideEditor";
import { mockBarGaugeDataForTestDataDs } from "./mockData";
import icon from './bargauge.svg'

const panelComponents: PanelPluginComponents = {
    panel: BarGaugePanel,
    editor: PanelEditor,
    overrideEditor: BarGaugeOverridesEditor,
    overrideRules: BarGaugeRules,
    getOverrideTargets: getBarguageOverrideTargets,
    mockDataForTestDataDs:  mockBarGaugeDataForTestDataDs,
    icon
}

export default  panelComponents