import { Input, Textarea } from "@chakra-ui/react"
import PanelAccordion from "components/dashboard/edit-panel/Accordion"
import PanelEditItem from "components/dashboard/edit-panel/PanelEditItem"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { Panel } from "types/dashboard"

interface Props {
    panel: Panel
    onChange: any
}

const TextPanelEditor = ({panel,onChange}:Props) => {
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