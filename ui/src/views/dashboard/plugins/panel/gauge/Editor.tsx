import { EditorNumberItem } from "components/editor/EditorItem"
import { UnitPicker } from "components/unit"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { PanelEditorProps } from "types/dashboard"

const GaugePanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<PanelAccordion title="Value setting">
        <PanelEditItem title="Min" desc="the minmum your value can be">
            <EditorNumberItem value={panel.plugins.gauge.value.min} onChange={(v) => onChange(panel => {
                panel.plugins.gauge.value.min = v
            })} />
        </PanelEditItem>
        <PanelEditItem title="Max">
            <EditorNumberItem value={panel.plugins.gauge.value.max} onChange={(v) => onChange(panel => {
                panel.plugins.gauge.value.max = v
            })} />
        </PanelEditItem>
        <PanelEditItem title="Unit">
            <UnitPicker type={panel.plugins.gauge.value.unitsType} value={panel.plugins.gauge.value.units} onChange={
                (units, type) => onChange(panel => {
                    panel.plugins.gauge.value.units = units
                    panel.plugins.gauge.value.unitsType = type
                })
            } />
        </PanelEditItem>
        <PanelEditItem title="Decimals">
            <EditorNumberItem value={panel.plugins.gauge.value.decimals} min={0} max={5} step={1} onChange={v => onChange(panel => { panel.plugins.gauge.value.decimals = v })} />
        </PanelEditItem>
    </PanelAccordion>
    )
}

export default GaugePanelEditor