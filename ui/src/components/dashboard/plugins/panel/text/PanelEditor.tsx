import { Input } from "@chakra-ui/react"
import PanelAccordion from "components/dashboard/edit-panel/Accordion"
import PanelEditItem from "components/dashboard/edit-panel/PanelEditItem"
import { useState } from "react"
import { Panel } from "types/dashboard"

interface Props {
    panel: Panel
    onChange: any
}

const TextPanelEditor = ({panel,onChange}:Props) => {
    const [tempPanel, setTempPanel] = useState<Panel>(panel)

    return (   <PanelAccordion title="Text setting">
        <PanelEditItem title="Title">
            <Input value={tempPanel.title} onChange={(e) => {
                setTempPanel({...tempPanel, title: e.currentTarget.value})
            }}
             onBlur={() => onChange(tempPanel)} />
        </PanelEditItem>
</PanelAccordion>
)
}

export default TextPanelEditor