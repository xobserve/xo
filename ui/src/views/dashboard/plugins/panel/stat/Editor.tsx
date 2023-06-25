import { HStack, Select, Text } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { UnitPicker } from "components/unit"
import { Panel, PanelEditorProps } from "types/dashboard"
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"


const GraphPanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<>
        <PanelAccordion title="Tooltip">
            <PanelEditItem title="Tooltip mode">
                <RadionButtons options={[{ label: "Single", value: "single" }, { label: "All", value: "all" }, { label: "Hidden", value: "hidden" }]} value={panel.plugins.stat.tooltip.mode} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.stat.tooltip.mode = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Legend">
            <PanelEditItem title="Legend mode">
                <RadionButtons options={[{ label: "Table", value: "table" }, { label: "Hidden", value: "hidden" }]} value={panel.plugins.stat.legend.mode} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.stat.legend.mode = v
                })} />

            </PanelEditItem>
            {panel.plugins.stat.legend.mode != 'hidden' && <PanelEditItem title="Legend placement">
                <RadionButtons options={[{ label: "Bottom", value: "bottom" }, { label: "Right", value: "right" }]} value={panel.plugins.stat.legend.placement} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.stat.legend.placement = v
                })} />
            </PanelEditItem>}
        </PanelAccordion>
        <PanelAccordion title="Graph styles">
            <PanelEditItem title="Style">
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={panel.plugins.stat.styles.style} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.stat.styles.style = v
                })} />
            </PanelEditItem>

            {panel.plugins.stat.styles.style != "points" &&
                <>
                    <PanelEditItem title="Line width">
                        <EditorSliderItem value={panel.plugins.stat.styles.lineWidth} min={0} max={10} step={1} onChange={v => onChange((panel:Panel) => {
                            panel.plugins.stat.styles.lineWidth = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title="Fill gradient mode">
                        <RadionButtons options={[{ label: "None", value: "none" }, { label: "Opacity", value: "opacity" }]} value={panel.plugins.stat.styles.gradientMode} onChange={v => onChange((panel:Panel) => {
                            panel.plugins.stat.styles.gradientMode = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title="Fill opacity" info={
                        <Text>You need to click Apply Button(in top-right) to see the new setting taken effect</Text>
                    }>
                        <EditorSliderItem value={panel.plugins.stat.styles.fillOpacity} min={0} max={100} step={1} onChange={v => onChange((panel:Panel) => {
                            panel.plugins.stat.styles.fillOpacity = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title="Show points">
                        <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: "always" }, { label: "Never", value: "never" }]} value={panel.plugins.stat.styles.showPoints} onChange={v => onChange((panel:Panel) => {
                            panel.plugins.stat.styles.showPoints = v
                        })} />
                    </PanelEditItem>
                </>}
            <PanelEditItem title="Point size">
                <EditorSliderItem value={panel.plugins.stat.styles.pointSize} min={1} max={20} step={1} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.stat.styles.pointSize = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Axis">
            <PanelEditItem title="Label">
                <EditorInputItem value={panel.plugins.stat.axis.label} onChange={v =>
                    onChange((panel:Panel) => {
                        panel.plugins.stat.axis.label = v
                    })
                } />
            </PanelEditItem>
            <PanelEditItem title="Show grid">
                <RadionButtons options={[{ label: "Show", value: true }, { label: "Hidden", value: false }]} value={panel.plugins.stat.axis.showGrid} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.stat.axis.showGrid = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Scale">
                <HStack spacing="1">
                    <RadionButtons options={[{ label: "Linear", value: "linear" }, { label: "Log", value: "log" }]} value={panel.plugins.stat.axis.scale} onChange={v => onChange((panel:Panel) => {
                        panel.plugins.stat.axis.scale = v
                    })} />
                    {panel.plugins.stat.axis.scale == "log" && <Select value={panel.plugins.stat.axis.scaleBase} onChange={e => onChange(panel =>
                        panel.plugins.stat.axis.scaleBase = Number(e.currentTarget.value) as 2 | 10
                    )} >
                        <option value={2}>Base 2</option>
                        <option value={10}>Base 10</option>
                    </Select>}
                </HStack>
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Standard options">
            <PanelEditItem title="Unit">
                <UnitPicker type={panel.plugins.stat.std.unitsType} value={panel.plugins.stat.std.units} onChange={
                    (units, type) => onChange((panel:Panel) => {
                        panel.plugins.stat.std.units = units
                        panel.plugins.stat.std.unitsType = type
                    })

                    // onPanelChange(units, type)
                } />
            </PanelEditItem>
            <PanelEditItem title="Decimals">
                <EditorNumberItem value={panel.plugins.stat.std.decimals ?? 2} min={0} max={5} step={1} onChange={v => onChange((panel:Panel) => { panel.plugins.stat.std.decimals = v })} />
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
}

export default GraphPanelEditor
