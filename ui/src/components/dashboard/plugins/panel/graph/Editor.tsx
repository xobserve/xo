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

const GraphPanelEditor = ({panel,onChange}:Props) => {
    const [tempPanel, setTempPanel] = useState<Panel>(panel)

    if (!tempPanel.pluginSettings.text) {
        tempPanel.pluginSettings.text = {}
    }
    
    return (   <PanelAccordion title="Text setting">
        <PanelEditItem title="Content">
            <Textarea value={tempPanel.pluginSettings.text.md} onChange={(e) => {
                tempPanel.pluginSettings.text.md = e.currentTarget.value
                setTempPanel(cloneDeep(tempPanel))
            }}
             onBlur={() => onChange(tempPanel)} />
        </PanelEditItem>
</PanelAccordion>
)
}

export default GraphPanelEditor