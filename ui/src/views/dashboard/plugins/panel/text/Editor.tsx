import { Textarea } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import {  Panel, PanelEditorProps } from "types/dashboard"
import React from "react";
import { useStore } from "@nanostores/react"
import { textPanelMsg } from "src/i18n/locales/en"

const TextPanelEditor = ({panel,onChange}:PanelEditorProps) => {
    const t1 = useStore(textPanelMsg)
    return (   <PanelAccordion title={t1.textSettings}>
        <PanelEditItem title={t1.content}>
            <Textarea value={panel.plugins.text.md} onChange={(e) => {
                const v = e.currentTarget.value 
                onChange((panel:Panel) => {
                    panel.plugins.text.md = v
                })
            }} />
        </PanelEditItem>

        <PanelEditItem title={t1.horizontalPos}>
            <RadionButtons options={[{ label: t1.left, value: "left" }, { label: t1.center, value: "center" },{ label: t1.right, value: "right" }]} value={panel.plugins.text.justifyContent} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.text.justifyContent = v
                })} />

        </PanelEditItem>

        <PanelEditItem title={t1.verticalPos}>
            <RadionButtons options={[{ label: t1.top, value: "top" }, { label: t1.center, value: "center" },{ label: t1.bottom, value: "end" }]} value={panel.plugins.text.alignItems} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.text.alignItems = v
                })} />

        </PanelEditItem>

        <PanelEditItem title="Font size">
            <EditorInputItem value={panel.plugins.text.fontSize} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.text.fontSize = v
                })} />
        </PanelEditItem>

        <PanelEditItem title="Font weight">
            <EditorInputItem value={panel.plugins.text.fontWeight} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.text.fontWeight = v
                })} />
        </PanelEditItem>
</PanelAccordion>
)
}

export default TextPanelEditor