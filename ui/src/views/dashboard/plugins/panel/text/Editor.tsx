import { Textarea } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import {  PanelEditorProps } from "types/dashboard"


const TextPanelEditor = ({panel,onChange}:PanelEditorProps) => {
    return (   <PanelAccordion title="Text setting">
        <PanelEditItem title="Content">
            <Textarea value={panel.plugins.text.md} onChange={(e) => {
                const v = e.currentTarget.value 
                onChange(panel => {
                    panel.plugins.text.md = v
                })
            }} />
        </PanelEditItem>
</PanelAccordion>
)
}

export default TextPanelEditor