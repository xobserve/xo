import { Textarea } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"


const TracePanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<PanelAccordion title="Text setting">
    </PanelAccordion>
    )
}

export default TracePanelEditor