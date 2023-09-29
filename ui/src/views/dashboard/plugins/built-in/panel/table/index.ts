
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import TablePanel from "./Table";
import TableOverridesEditor, { TableRules, getTableOverrideTargets } from "./OverridesEditor";
import { mockTableDataForTestDataDs } from "./mockData";
import icon from './table.svg'


const panelComponents: PanelPluginComponents = {
    panel: TablePanel,
    editor: PanelEditor,
    overrideEditor: TableOverridesEditor,
    overrideRules: TableRules,
    getOverrideTargets: getTableOverrideTargets,
    mockDataForTestDataDs:  mockTableDataForTestDataDs,
    icon
}

export default  panelComponents