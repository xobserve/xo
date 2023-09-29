
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import TextPanel from "./Text";
import icon from './icon.svg'
import { PanelTypeText } from "./types";


const panelComponents: PanelPluginComponents = {
    panel: TextPanel,
    editor: PanelEditor,
    settings: {
        type: PanelTypeText,
        icon,
        initOptions: {
            disableDatasource: true,
            md: `#Welcome to Datav\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!`,
            justifyContent: "left",
            alignItems: "top",
            fontSize: '1.2em',
            fontWeight: '500',
        }
    },
}

export default  panelComponents