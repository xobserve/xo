import { HStack, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Textarea } from "@chakra-ui/react"
import PanelAccordion from "components/dashboard/edit-panel/Accordion"
import PanelEditItem from "components/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { cloneDeep, defaults } from "lodash"
import { useEffect, useState } from "react"
import { GraphSettings, Panel } from "types/dashboard"

interface Props {
    panel: Panel
    onChange: any
}

const GraphPanelEditor = ({ panel, onChange }: Props) => {
    const [tempPanel, setTempPanel] = useState<Panel>(panel)

    // assign default settings to panel
    defaults(tempPanel.settings.graph, initGraphSettings)

    const onPanelChange = () => {
        const p = cloneDeep(tempPanel)
        setTempPanel(p)
        onChange(p)
    }
    return (<>
        <PanelAccordion title="Tooltip">
            <PanelEditItem title="Tooltip mode">
                <RadionButtons options={[{ label: "Single", value: "single" }, { label: "All", value: "all" }, { label: "Hidden", value: "hidden" }]} value={tempPanel.settings.graph.tooltip.mode} onChange={v => {
                    tempPanel.settings.graph.tooltip.mode = v
                    onPanelChange()
                }} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Legend">
            <PanelEditItem title="Legend mode">
                <RadionButtons options={[{ label: "Table", value: "table" }, { label: "Hidden", value: "hidden" }]} value={tempPanel.settings.graph.legend.mode} onChange={v => {
                    tempPanel.settings.graph.legend.mode = v
                    onPanelChange()
                }} />
            </PanelEditItem>
            {tempPanel.settings.graph.legend.mode  != 'hidden' && <PanelEditItem title="Legend placement">
                <RadionButtons options={[{ label: "Bottom", value: "bottom" }, { label: "Right", value: "right" }]} value={tempPanel.settings.graph.legend.placement} onChange={v => {
                    tempPanel.settings.graph.legend.placement = v
                    onPanelChange()
                }} />
            </PanelEditItem>}
        </PanelAccordion>
        <PanelAccordion title="Graph styles">
            <PanelEditItem title="Style">
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={tempPanel.settings.graph.styles.style} onChange={v => {
                    tempPanel.settings.graph.styles.style = v
                    onPanelChange()
                }} />
            </PanelEditItem>
            <PanelEditItem title="Line width">
                <HStack>
                    <Slider aria-label='slider-ex-1' value={tempPanel.settings.graph.styles.lineWidth} min={0} max={10} step={1} onChange={v => {
                        tempPanel.settings.graph.styles.lineWidth = v
                        setTempPanel(cloneDeep(tempPanel))
                    }} onBlur={() => onChange(tempPanel)}>
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb children={tempPanel.settings.graph.styles.lineWidth} fontSize='sm' boxSize='25px'/>
                    </Slider>
                </HStack>
            </PanelEditItem>
            <PanelEditItem title="Fill opacity">
                <HStack>
                    <Slider aria-label='slider-ex-1' value={tempPanel.settings.graph.styles.fillOpacity} min={0} max={100} step={1} onChange={v => {
                        tempPanel.settings.graph.styles.fillOpacity = v
                        setTempPanel(cloneDeep(tempPanel))
                    }} onBlur={() => onChange(tempPanel)}>
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb children={tempPanel.settings.graph.styles.fillOpacity} fontSize='sm' boxSize='25px'/>
                    </Slider>
                </HStack>
            </PanelEditItem>
            <PanelEditItem title="Show points">
                <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: "always" }, { label: "Never", value: "never" }]} value={tempPanel.settings.graph.styles.showPoints} onChange={v => {
                    tempPanel.settings.graph.styles.showPoints = v
                    onPanelChange()
                }} />
            </PanelEditItem>
            <PanelEditItem title="Point size">
                <HStack>
                    <Slider aria-label='slider-ex-1' value={tempPanel.settings.graph.styles.pointSize} min={1} max={20} step={1} onChange={v => {
                        tempPanel.settings.graph.styles.pointSize = v
                        setTempPanel(cloneDeep(tempPanel))
                    }} onBlur={() => onChange(tempPanel)}>
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb children={tempPanel.settings.graph.styles.pointSize} fontSize='sm' boxSize='25px'/>
                    </Slider>
                </HStack>
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
}

export default GraphPanelEditor

export const initGraphSettings: GraphSettings = {
    tooltip: {
        mode: 'all',
        sort: 'desc'
    },
    legend: {
        mode: "table",
        placement: "bottom"
    },
    styles: {
        style: "lines",
        lineWidth: 2,
        fillOpacity: 21,
        showPoints: "auto",
        pointSize: 5
    }
}