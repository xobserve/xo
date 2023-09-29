
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import AlertPanel from "./Alert";

const panelComponents: PanelPluginComponents = {
    panel: AlertPanel,
    editor: PanelEditor,
}

export default  panelComponents