
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import Panel from "./Panel";
import icon from './icon.svg'
import { PanelType } from "./types";


const panelComponents: PanelPluginComponents = {
    panel: Panel,
    editor: PanelEditor,
    settings: {
        type: PanelType,
        icon,
        initOptions: {
            disableDatasource: true,
            md: `#Welcome to xobserve\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!`,
            justifyContent: "left",
            alignItems: "top",
            fontSize: '1.2em',
            fontWeight: '500',
        }
    },
}

export default  panelComponents