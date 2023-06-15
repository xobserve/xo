import { Select, Switch } from "@chakra-ui/react"
import { useEffect, useLayoutEffect, useMemo } from "react"
import { Panel } from "types/dashboard"
import PanelAccordion from "./Accordion"
import PanelEditItem from "./PanelEditItem"

interface Props {
    panel: Panel
    onChange: any
}

const PanelStyles = ({panel, onChange}:Props) => {
    const borderOptions = useMemo(() => {
        const options = []
        for (let i=1;i<=13;i++) {
            options.push(<option value={`Border${i}`}>Style{i}</option>)
        }
        return options
    },[])
    return (
        <>
            <PanelAccordion title="Panel border">
                <Select value={panel.styles?.border} onChange={e => {
                    const v = e.currentTarget.value
                    onChange(panel => {
                        panel.styles.border =  v
                    })
                }}>
                    <option value="None">None</option>
                    <option value="normal">Normal</option>
                    {
                       borderOptions.map(Option => Option)
                    }
                </Select>
            </PanelAccordion>
        </>
    )
}

export default PanelStyles