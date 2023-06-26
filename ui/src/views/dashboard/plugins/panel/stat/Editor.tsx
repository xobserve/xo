import { Button, HStack, Select, Switch, Text } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { UnitPicker } from "components/unit"
import { Panel, PanelEditorProps } from "types/dashboard"
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"
import { ColorPicker } from "components/color-picker"
import { colors } from "utils/colors"
import { dispatch } from "use-bus"
import { EditPanelForceRebuildEvent, PanelForceRebuildEvent } from "src/data/bus-events"


const GraphPanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<>
        <PanelAccordion title="Basic setting">
            <PanelEditItem title="Show tooltip">
                <Switch defaultChecked={panel.plugins.stat.showTooltip} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.showTooltip = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Show legend">
                <Switch defaultChecked={panel.plugins.stat.showLegend} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.showLegend = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Unit">
                <UnitPicker type={panel.plugins.stat.unitsType} value={panel.plugins.stat.units} onChange={
                    (units, type) => onChange((panel: Panel) => {
                        panel.plugins.stat.units = units
                        panel.plugins.stat.unitsType = type
                    })

                    // onPanelChange(units, type)
                } />
            </PanelEditItem>
            <PanelEditItem title="Decimals">
                <EditorNumberItem value={panel.plugins.stat.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.stat.decimal = v })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Styles">
            <PanelEditItem title="Style">
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }]} value={panel.plugins.stat.styles.style} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.style = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Fill gradient mode">
                <RadionButtons options={[{ label: "None", value: "none" }, { label: "Opacity", value: "opacity" }]} value={panel.plugins.stat.styles.gradientMode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.gradientMode = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Fill opacity">
                <EditorSliderItem value={panel.plugins.stat.styles.fillOpacity} min={0} max={100} step={1} onChange={v => {
                    onChange((panel: Panel) => {
                        panel.plugins.stat.styles.fillOpacity = v
                    })
                    dispatch(EditPanelForceRebuildEvent + panel.id)
                }
                } />
            </PanelEditItem>
            <PanelEditItem title="Color">
                <ColorPicker presetColors={colors} color={panel.plugins.stat.styles.color} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.color = v.hex
                })}>
                    <Button size="sm" background={panel.plugins.stat.styles.color} _hover={{ bg: panel.plugins.stat.styles.color }}>Pick color</Button>
                </ColorPicker>
            </PanelEditItem>

            <PanelEditItem title="Graph height" desc="the propotion of the graph part">
                <EditorSliderItem value={panel.plugins.stat.styles.graphHeight} min={0} max={100} step={5} onChange={v => {
                    onChange((panel: Panel) => {
                        panel.plugins.stat.styles.graphHeight = v
                    })
                }
                } />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Axis">
            <PanelEditItem title="Scale">
                <HStack spacing="1">
                    <RadionButtons options={[{ label: "Linear", value: "linear" }, { label: "Log", value: "log" }]} value={panel.plugins.stat.axisY.scale} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.stat.axisY.scale = v
                    })} />
                </HStack>
            </PanelEditItem>

            {panel.plugins.stat.axisY.scale == "log" && <PanelEditItem title="Scale base">
                <RadionButtons options={[{ label: "Base 2", value: "2" }, { label: "Base 10", value: "10" }]} value={panel.plugins.stat.axisY.scaleBase as any} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.axisY.scaleBase = v
                })} />
            </PanelEditItem>}
        </PanelAccordion>
    </>
    )
}

export default GraphPanelEditor
