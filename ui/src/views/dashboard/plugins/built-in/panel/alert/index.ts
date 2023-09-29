
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import AlertPanel from "./Alert";
import icon from './alert.svg'

const panelComponents: PanelPluginComponents = {
    panel: AlertPanel,
    editor: PanelEditor,
    icon
}

export default  panelComponents