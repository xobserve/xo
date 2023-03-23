import { HStack, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Select, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Textarea } from "@chakra-ui/react"
import PanelAccordion from "components/dashboard/edit-panel/Accordion"
import PanelEditItem from "components/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { UnitPicker } from "components/unit"
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

    const onPanelChange = (units?,type?) => {
        if (units) {
            tempPanel.settings.graph.std.units = units
            tempPanel.settings.graph.std.unitsType = type
        }
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
            {tempPanel.settings.graph.legend.mode != 'hidden' && <PanelEditItem title="Legend placement">
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

            {tempPanel.settings.graph.styles.style != "points" &&
                <>
                    <PanelEditItem title="Line width">
                        <HStack>
                            <Slider aria-label='slider-ex-1' value={tempPanel.settings.graph.styles.lineWidth} min={0} max={10} step={1} onChange={v => {
                                tempPanel.settings.graph.styles.lineWidth = v
                                setTempPanel(cloneDeep(tempPanel))
                            }} onChangeEnd={v => {
                                tempPanel.settings.graph.styles.lineWidth = v
                                onPanelChange()
                            }}>
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb children={tempPanel.settings.graph.styles.lineWidth} fontSize='sm' boxSize='25px' />
                            </Slider>
                        </HStack>
                    </PanelEditItem>
                    <PanelEditItem title="Fill gradient mode">
                        <RadionButtons options={[{ label: "None", value: "none" }, { label: "Opacity", value: "opacity" }]} value={tempPanel.settings.graph.styles.gradientMode} onChange={v => {
                            tempPanel.settings.graph.styles.gradientMode = v
                            onPanelChange()
                        }} />
                    </PanelEditItem>
                    <PanelEditItem title="Fill opacity">
                        <HStack>
                            <Slider aria-label='slider-ex-1' value={tempPanel.settings.graph.styles.fillOpacity} min={0} max={100} step={1} onChange={v => {
                                tempPanel.settings.graph.styles.fillOpacity = v
                                setTempPanel(cloneDeep(tempPanel))
                            }} onChangeEnd={v => {
                                tempPanel.settings.graph.styles.fillOpacity = v
                                onPanelChange()
                            }}>
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb children={tempPanel.settings.graph.styles.fillOpacity} fontSize='sm' boxSize='25px' />
                            </Slider>
                        </HStack>
                    </PanelEditItem>
                    <PanelEditItem title="Show points">
                        <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: "always" }, { label: "Never", value: "never" }]} value={tempPanel.settings.graph.styles.showPoints} onChange={v => {
                            tempPanel.settings.graph.styles.showPoints = v
                            onPanelChange()
                        }} />
                    </PanelEditItem>
                </>}
            <PanelEditItem title="Point size">
                <HStack>
                    <Slider aria-label='slider-ex-1' value={tempPanel.settings.graph.styles.pointSize} min={1} max={20} step={1} onChange={v => {
                        tempPanel.settings.graph.styles.pointSize = v
                        setTempPanel(cloneDeep(tempPanel))
                    }} onChangeEnd={v => {
                        tempPanel.settings.graph.styles.pointSize = v
                        onPanelChange()
                    }}>
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb children={tempPanel.settings.graph.styles.pointSize} fontSize='sm' boxSize='25px' />
                    </Slider>
                </HStack>
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Axis">
            <PanelEditItem title="Label">
                <Input value={tempPanel.settings.graph.axis.label} onChange={(e) => {
                    tempPanel.settings.graph.axis.label = e.currentTarget.value
                    setTempPanel(cloneDeep(tempPanel))
                }}
                    onBlur={() => onChange(tempPanel)} />
            </PanelEditItem>
            <PanelEditItem title="Show grid">
                <RadionButtons options={[{ label: "Show", value: true }, { label: "Hidden", value: false }]} value={tempPanel.settings.graph.axis.showGrid} onChange={v => {
                    tempPanel.settings.graph.axis.showGrid = v
                    onPanelChange()
                }} />
            </PanelEditItem>
            <PanelEditItem title="Scale">
                <HStack spacing="1">
                    <RadionButtons options={[{ label: "Linear", value: "linear" }, { label: "Log", value: "log" }]} value={tempPanel.settings.graph.axis.scale} onChange={v => {
                        tempPanel.settings.graph.axis.scale = v
                        onPanelChange()
                    }} />
                    {tempPanel.settings.graph.axis.scale == "log" && <Select value={tempPanel.settings.graph.axis.scaleBase} onChange={e => {
                        tempPanel.settings.graph.axis.scaleBase = Number(e.currentTarget.value) as 2 | 10
                        onPanelChange()
                    }} >
                        <option value={2}>Base 2</option>
                        <option value={10}>Base 10</option>
                    </Select>}
                </HStack>
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Standard options">
            <PanelEditItem title="Unit">
                <UnitPicker type={tempPanel.settings.graph.std.unitsType} value={tempPanel.settings.graph.std.units} onChange={
                    (units,type) =>  onPanelChange(units,type)
                } />
            </PanelEditItem>
            <PanelEditItem title="Decimals">
            <NumberInput value={tempPanel.settings.graph.std.decimals ?? 2}  min={0} max={3} step={1} onChange={(_,v) => {
                 tempPanel.settings.graph.std.decimals = v
                 onPanelChange()
            }}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
                </NumberInput>
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
        showPoints: "never",
        pointSize: 5,
        gradientMode: "opacity"
    },
    axis: {
        showGrid: true,
        scale: "linear",
        scaleBase: 2
    },
    std: {
        unitsType: 'none' ,
        units: [],
        decimals: 2
    }
}