
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import TextPanel from "./Text";
import icon from './text.svg'


const panelComponents: PanelPluginComponents = {
    panel: TextPanel,
    editor: PanelEditor,
    icon,
}

export default  panelComponents