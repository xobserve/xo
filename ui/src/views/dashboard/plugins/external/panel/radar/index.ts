import { PanelPluginComponents } from "types/plugin";
import PanelComponent, { mockDataForTestDataDs } from "./Panel";
import PanelEditor from "./Editor";
import OverrideEditor, { OverrideRules, getOverrideTargets } from "./OverrideEditor";
import icon from './icon.svg'
import { PanelTypeRadar, initSettings } from "./types";


const panelComponents: PanelPluginComponents = {
    panel: PanelComponent,
    editor: PanelEditor,
    overrideEditor: OverrideEditor,
    overrideRules: OverrideRules,
    getOverrideTargets: getOverrideTargets,
    mockDataForTestDataDs: mockDataForTestDataDs,
    settings: {
        type: PanelTypeRadar,
        icon,
        initOptions: initSettings
    }
}

export default panelComponents