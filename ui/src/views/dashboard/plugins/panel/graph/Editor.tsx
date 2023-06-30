import { HStack, Select, Switch, Text } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { UnitPicker } from "components/unit"
import { Panel, PanelEditorProps } from "types/dashboard"
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"
import { dispatch } from "use-bus"
import {  PanelForceRebuildEvent } from "src/data/bus-events"
import PopoverSelect from "components/select/PopoverSelect"
import { ValueCalculationType } from "types/value"


const GraphPanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<>
        <PanelAccordion title="Tooltip">
            <PanelEditItem title="Tooltip mode">
                <RadionButtons options={[{ label: "Single", value: "single" }, { label: "All", value: "all" }, { label: "Hidden", value: "hidden" }]} value={panel.plugins.graph.tooltip.mode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.tooltip.mode = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Legend">
            <PanelEditItem title="Legend mode">
                <RadionButtons options={[{ label: "Table", value: "table" }, { label: "Hidden", value: "hidden" }]} value={panel.plugins.graph.legend.mode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.legend.mode = v
                })} />

            </PanelEditItem>
            {panel.plugins.graph.legend.mode != 'hidden' && <>
            <PanelEditItem title="Legend placement">
                <RadionButtons options={[{ label: "Bottom", value: "bottom" }, { label: "Right", value: "right" }]} value={panel.plugins.graph.legend.placement} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.legend.placement = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Values" desc="caculate values for legend to show">
                <PopoverSelect value={panel.plugins.graph.legend.valueCalcs} isMulti options={Object.keys(ValueCalculationType).map(k => ({label: k,value: k}))}  onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.legend.valueCalcs = v as any
                })} />
            </PanelEditItem>
            </>}
        </PanelAccordion>
        <PanelAccordion title="Graph styles">
            <PanelEditItem title="Style">
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={panel.plugins.graph.styles.style} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.styles.style = v
                })} />
            </PanelEditItem>

            {panel.plugins.graph.styles.style != "points" &&
                <>
                    <PanelEditItem title="Line width">
                        <EditorSliderItem value={panel.plugins.graph.styles.lineWidth} min={0} max={10} step={1} onChange={v => onChange((panel: Panel) => {
                            panel.plugins.graph.styles.lineWidth = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title="Fill gradient mode">
                        <RadionButtons options={[{ label: "None", value: "none" }, { label: "Opacity", value: "opacity" }]} value={panel.plugins.graph.styles.gradientMode} onChange={v => onChange((panel: Panel) => {
                            panel.plugins.graph.styles.gradientMode = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title="Fill opacity">
                        <EditorSliderItem value={panel.plugins.graph.styles.fillOpacity} min={0} max={100} step={1} onChange={v => {
                            onChange((panel: Panel) => {
                                panel.plugins.graph.styles.fillOpacity = v
                            })
                            dispatch(PanelForceRebuildEvent + panel.id)
                        }
                        } />
                    </PanelEditItem>

                    <PanelEditItem title="Show points">
                        <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: "always" }, { label: "Never", value: "never" }]} value={panel.plugins.graph.styles.showPoints} onChange={v => onChange((panel: Panel) => {
                            panel.plugins.graph.styles.showPoints = v
                        })} />
                    </PanelEditItem>
                </>}
            <PanelEditItem title="Point size">
                <EditorSliderItem value={panel.plugins.graph.styles.pointSize} min={1} max={20} step={1} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.styles.pointSize = v
                })} />
            </PanelEditItem>

            <PanelEditItem title="Connect null values">
                <Switch defaultChecked={panel.plugins.graph.styles.connectNulls} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.graph.styles.connectNulls = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Axis">
            <PanelEditItem title="Label">
                <EditorInputItem value={panel.plugins.graph.axis.label} onChange={v =>
                    onChange((panel: Panel) => {
                        panel.plugins.graph.axis.label = v
                    })
                } />
            </PanelEditItem>
            <PanelEditItem title="Show grid">
                <RadionButtons options={[{ label: "Show", value: true }, { label: "Hidden", value: false }]} value={panel.plugins.graph.axis.showGrid} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.axis.showGrid = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Scale">
                    <RadionButtons options={[{ label: "Linear", value: "linear" }, { label: "Log", value: "log" }]} value={panel.plugins.graph.axis.scale} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.graph.axis.scale = v
                    })} />
            </PanelEditItem>
            {panel.plugins.graph.axis.scale == "log" && <PanelEditItem title="Scale Base">
                <RadionButtons options={[{ label: "Base 2", value: "2" }, { label: "Base 10", value: "10" }]} value={panel.plugins.graph.axis.scaleBase as any} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.axis.scaleBase = v
                })} />
            </PanelEditItem>}
        </PanelAccordion>

        <PanelAccordion title="Value">
            <PanelEditItem title="Unit">
                <UnitPicker type={panel.plugins.graph.value.unitsType} value={panel.plugins.graph.value.units} onChange={
                    (units, type) => onChange((panel: Panel) => {
                        panel.plugins.graph.value.units = units
                        panel.plugins.graph.value.unitsType = type
                    })

                    // onPanelChange(units, type)
                } />
            </PanelEditItem>
            <PanelEditItem title="Decimal">
                <EditorNumberItem value={panel.plugins.graph.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.graph.value.decimal = v })} />
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
}

export default GraphPanelEditor
