import { Switch } from "@chakra-ui/react"
import { EditorNumberItem } from "components/editor/EditorItem"
import { UnitPicker } from "components/unit"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"

const GaugePanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (
        <>
            <PanelAccordion title="basic setting">
                <PanelEditItem title="Animation" desc="display chart animation">
                    <Switch defaultChecked={panel.plugins.gauge.animation} onChange={e => onChange((panel:Panel) => {
                        panel.plugins.gauge.animation = e.currentTarget.checked
                    })} />
                </PanelEditItem>
            </PanelAccordion>
            <PanelAccordion title="Value setting">
                <PanelEditItem title="Min" desc="the minmum your value can be">
                    <EditorNumberItem value={panel.plugins.gauge.value.min} onChange={(v) => onChange((panel:Panel) => {
                        panel.plugins.gauge.value.min = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Max">
                    <EditorNumberItem value={panel.plugins.gauge.value.max} onChange={(v) => onChange((panel:Panel) => {
                        panel.plugins.gauge.value.max = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Unit">
                    <UnitPicker type={panel.plugins.gauge.value.unitsType} value={panel.plugins.gauge.value.units} onChange={
                        (units, type) => onChange((panel:Panel) => {
                            panel.plugins.gauge.value.units = units
                            panel.plugins.gauge.value.unitsType = type
                        })
                    } />
                </PanelEditItem>
                <PanelEditItem title="Decimals">
                    <EditorNumberItem value={panel.plugins.gauge.value.decimals} min={0} max={5} step={1} onChange={v => onChange((panel:Panel) => { panel.plugins.gauge.value.decimals = v })} />
                </PanelEditItem>
            </PanelAccordion>
            {/* enable: boolean
        splitNumber: number
        fontSize: number */}
            <PanelAccordion title="Scale">
                <PanelEditItem title="Dispaly scale line">
                    <Switch defaultChecked={panel.plugins.gauge.scale.enable} onChange={e => {
                        onChange((panel:Panel) => {
                        panel.plugins.gauge.scale.enable = e.currentTarget.checked
                    })}} />
                </PanelEditItem>
                <PanelEditItem title="Split numbers">
                    <EditorNumberItem value={panel.plugins.gauge.scale.splitNumber} min={0} max={10} step={1} onChange={v => onChange((panel:Panel) => { panel.plugins.gauge.scale.splitNumber = v })} />
                </PanelEditItem>
                <PanelEditItem title="Font size">
                    <EditorNumberItem value={panel.plugins.gauge.scale.fontSize} min={12} max={20} step={1} onChange={v => onChange((panel:Panel) => { panel.plugins.gauge.scale.fontSize = v })} />
                </PanelEditItem>
            </PanelAccordion>

        </>
    )
}

export default GaugePanelEditor