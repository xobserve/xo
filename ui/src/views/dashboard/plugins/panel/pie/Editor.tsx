import { Select, Switch } from "@chakra-ui/react"
import RadionButtons from "components/RadioButtons"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import { PieLegendPlacement } from "types/panel/plugins"

const PiePanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<>
        <PanelAccordion title="Basic setting">
            <PanelEditItem title="Animation" desc="display chart animation">
                <Switch defaultChecked={panel.plugins.pie.animation} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.animation = e.currentTarget.checked
                })} />
            </PanelEditItem>

            <PanelEditItem title="Show label">
                <Switch defaultChecked={panel.plugins.pie.showLabel} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.showLabel = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Shape">
            <PanelEditItem title="Type">
                <RadionButtons options={[{ label: "Normal", value: "normal" }, { label: "Rose", value: "rose" }]} value={panel.plugins.pie.shape.type} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.type = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Border radius">
                <EditorNumberItem value={panel.plugins.pie.shape.borderRadius} min={0} max={20} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.borderRadius = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Pie radius">
                <EditorNumberItem value={panel.plugins.pie.shape.radius} min={0} max={100} step={5} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.radius = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Inner radius">
                <EditorNumberItem value={panel.plugins.pie.shape.innerRadius} min={0} max={100} step={5} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.innerRadius = v
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Legend">
            <PanelEditItem title="Show">
                <Switch defaultChecked={panel.plugins.pie.legend.show} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.show = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Orient">
                <RadionButtons options={[{ label: "Vertical", value: "vertical" }, { label: "Horizontal", value: "horizontal" }]} value={panel.plugins.pie.legend.orient} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.orient = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Placement">
                <Select value={panel.plugins.pie.legend.placement} onChange={e => {
                    const v = e.currentTarget.value
                    onChange((panel: Panel) => {
                        panel.plugins.pie.legend.placement = v as any
                    })
                }}>
                    {
                        Object.keys(PieLegendPlacement).map(k =>  <option value={PieLegendPlacement[k]}>{k}</option>)
                    }
                </Select>
            </PanelEditItem>

        </PanelAccordion>
    </>
    )
}

export default PiePanelEditor