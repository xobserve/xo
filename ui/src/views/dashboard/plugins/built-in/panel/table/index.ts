
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import TablePanel from "./Table";
import TableOverridesEditor, { TableRules, getTableOverrideTargets } from "./OverridesEditor";
import { mockTableDataForTestDataDs } from "./mockData";


const panelComponents: PanelPluginComponents = {
    panel: TablePanel,
    editor: PanelEditor,
    overrideEditor: TableOverridesEditor,
    overrideRules: TableRules,
    getOverrideTargets: getTableOverrideTargets,
    mockDataForTestDataDs:  mockTableDataForTestDataDs
}

export default  panelComponents