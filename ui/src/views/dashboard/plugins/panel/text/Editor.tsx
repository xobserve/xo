import { Textarea } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { Panel, PanelEditorProps } from "types/dashboard"


const TextPanelEditor = ({panel,onChange}:PanelEditorProps) => {
    return (   <PanelAccordion title="Text setting">
        <PanelEditItem title="Content">
            <Textarea value={panel.settings.text.md} onChange={(e) => {
                const v = e.currentTarget.value 
                onChange(panel => {
                    panel.settings.text.md = v
                })
            }} />
        </PanelEditItem>
</PanelAccordion>
)
}

export default TextPanelEditor