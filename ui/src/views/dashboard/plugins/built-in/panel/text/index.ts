
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import TextPanel from "./Text";


const panelComponents: PanelPluginComponents = {
    panel: TextPanel,
    editor: PanelEditor,
}

export default  panelComponents