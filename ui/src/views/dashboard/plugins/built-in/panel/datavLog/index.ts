
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import DatavLogPanel from "./Panel";
import icon from './icon.svg'
import { PanelType } from "./types";
import { mockLogDataForTestDataDs } from "./mocks/mockData";


const panelComponents: PanelPluginComponents = {
    panel: DatavLogPanel,
    editor: PanelEditor,
    mockDataForTestDataDs: mockLogDataForTestDataDs,
    settings: {
        type: PanelType,
        icon,
        initOptions: {
            md: `#Welcome to Datav1\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!`,
            justifyContent: "left",
            alignItems: "top",
            fontSize: '1.2em',
            fontWeight: '500',
        }
    },
}

export default  panelComponents