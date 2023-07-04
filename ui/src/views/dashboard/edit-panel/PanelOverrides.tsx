import { PanelEditorProps, PanelType } from "types/dashboard"
import GraphOverridesEditor from "../plugins/panel/graph/OverridesEditor";


const PanelOverrides = (props: PanelEditorProps) => {
    switch (props.panel.type) {
        case PanelType.Graph:
            return (<GraphOverridesEditor {...props} />)
    
        default:
            return (<>
                </>)
    }
}

export default PanelOverrides