import { Textarea } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { Panel, PanelEditorProps } from "types/dashboard"


const TextPanelEditor = ({panel,onChange}:PanelEditorProps) => {
    const [tempPanel, setTempPanel] = useState<Panel>(panel)

    if (!tempPanel.settings.text) {
        tempPanel.settings.text = {}
    }
    
    return (   <PanelAccordion title="Text setting">
        <PanelEditItem title="Content">
            <Textarea value={tempPanel.settings.text.md} onChange={(e) => {
                tempPanel.settings.text.md = e.currentTarget.value
                setTempPanel(cloneDeep(tempPanel))
            }}
             onBlur={() => {
                onChange(tempPanel)
                
                }} />
        </PanelEditItem>
</PanelAccordion>
)
}

export default TextPanelEditor