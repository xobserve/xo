import { HStack, Select } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { UnitPicker } from "components/unit"
import { PanelEditorProps } from "types/dashboard"
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "src/views/dashboard/edit-panel/EditorItem"


const GraphPanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<>
        <PanelAccordion title="Tooltip">
            <PanelEditItem title="Tooltip mode">
                <RadionButtons options={[{ label: "Single", value: "single" }, { label: "All", value: "all" }, { label: "Hidden", value: "hidden" }]} value={panel.settings.graph.tooltip.mode} onChange={v => onChange(panel => {
                    panel.settings.graph.tooltip.mode = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Legend">
            <PanelEditItem title="Legend mode">
                <RadionButtons options={[{ label: "Table", value: "table" }, { label: "Hidden", value: "hidden" }]} value={panel.settings.graph.legend.mode} onChange={v => onChange(panel => {
                    panel.settings.graph.legend.mode = v
                })} />

            </PanelEditItem>
            {panel.settings.graph.legend.mode != 'hidden' && <PanelEditItem title="Legend placement">
                <RadionButtons options={[{ label: "Bottom", value: "bottom" }, { label: "Right", value: "right" }]} value={panel.settings.graph.legend.placement} onChange={v => onChange(panel => {
                    panel.settings.graph.legend.placement = v
                })} />
            </PanelEditItem>}
        </PanelAccordion>
        <PanelAccordion title="Graph styles">
            <PanelEditItem title="Style">
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={panel.settings.graph.styles.style} onChange={v => onChange(panel => {
                    panel.settings.graph.styles.style = v
                })} />
            </PanelEditItem>

            {panel.settings.graph.styles.style != "points" &&
                <>
                    <PanelEditItem title="Line width">
                        <EditorSliderItem value={panel.settings.graph.styles.lineWidth} min={0} max={10} step={1} onChange={v => onChange(panel => {
                            panel.settings.graph.styles.lineWidth = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title="Fill gradient mode">
                        <RadionButtons options={[{ label: "None", value: "none" }, { label: "Opacity", value: "opacity" }]} value={panel.settings.graph.styles.gradientMode} onChange={v => onChange(panel => {
                            panel.settings.graph.styles.gradientMode = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title="Fill opacity">
                        <EditorSliderItem value={panel.settings.graph.styles.fillOpacity} min={0} max={100} step={1} onChange={v => onChange(panel => {
                            panel.settings.graph.styles.fillOpacity = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title="Show points">
                        <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: "always" }, { label: "Never", value: "never" }]} value={panel.settings.graph.styles.showPoints} onChange={v => onChange(panel => {
                            panel.settings.graph.styles.showPoints = v
                        })} />
                    </PanelEditItem>
                </>}
            <PanelEditItem title="Point size">
                <EditorSliderItem value={panel.settings.graph.styles.pointSize} min={1} max={20} step={1} onChange={v => onChange(panel => {
                    panel.settings.graph.styles.pointSize = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Axis">
            <PanelEditItem title="Label">
                <EditorInputItem value={panel.settings.graph.axis.label} onChange={v => 
                    onChange(panel => {
                        panel.settings.graph.axis.label = v
                    })
                 } />
            </PanelEditItem>
            <PanelEditItem title="Show grid">
                <RadionButtons options={[{ label: "Show", value: true }, { label: "Hidden", value: false }]} value={panel.settings.graph.axis.showGrid} onChange={v => onChange(panel => {
                    panel.settings.graph.axis.showGrid = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Scale">
                <HStack spacing="1">
                    <RadionButtons options={[{ label: "Linear", value: "linear" }, { label: "Log", value: "log" }]} value={panel.settings.graph.axis.scale} onChange={v => onChange(panel => {
                        panel.settings.graph.axis.scale = v
                    })} />
                    {panel.settings.graph.axis.scale == "log" && <Select value={panel.settings.graph.axis.scaleBase} onChange={e => onChange(panel =>
                        panel.settings.graph.axis.scaleBase = Number(e.currentTarget.value) as 2 | 10
                    )} >
                        <option value={2}>Base 2</option>
                        <option value={10}>Base 10</option>
                    </Select>}
                </HStack>
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Standard options">
            <PanelEditItem title="Unit">
                <UnitPicker type={panel.settings.graph.std.unitsType} value={panel.settings.graph.std.units} onChange={
                    (units, type) => onChange(panel => {
                        panel.settings.graph.std.units = units
                        panel.settings.graph.std.unitsType = type
                    })

                    // onPanelChange(units, type)
                } />
            </PanelEditItem>
            <PanelEditItem title="Decimals">
                <EditorNumberItem value={panel.settings.graph.std.decimals ?? 2}  min={0} max={5} step={1}  onChange={v => onChange(panel => { panel.settings.graph.std.decimals = v})}/>
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
}

export default GraphPanelEditor
