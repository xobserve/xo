// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Textarea } from "@chakra-ui/react"
import { EditorInputItem } from "src/components/editor/EditorItem"
import RadionButtons from "src/components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { textPanelMsg } from "src/i18n/locales/en"

const TextPanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t1 = useStore(textPanelMsg)
    return (<PanelAccordion title={t1.textSettings}>
        <PanelEditItem title={t1.content}>
            <Textarea value={panel.plugins.text.md} onChange={(e) => {
                const v = e.currentTarget.value
                onChange((panel: Panel) => {
                    panel.plugins.text.md = v
                })
            }} />
        </PanelEditItem>

        <PanelEditItem title={t1.horizontalPos}>
            <RadionButtons options={[{ label: t1.left, value: "left" }, { label: t1.center, value: "center" }, { label: t1.right, value: "right" }]} value={panel.plugins.text.justifyContent} onChange={v => onChange((panel: Panel) => {
                panel.plugins.text.justifyContent = v
            })} />

        </PanelEditItem>

        <PanelEditItem title={t1.verticalPos}>
            <RadionButtons options={[{ label: t1.top, value: "top" }, { label: t1.center, value: "center" }, { label: t1.bottom, value: "end" }]} value={panel.plugins.text.alignItems} onChange={v => onChange((panel: Panel) => {
                panel.plugins.text.alignItems = v
            })} />

        </PanelEditItem>

        <PanelEditItem title="Font size">
            <EditorInputItem value={panel.plugins.text.fontSize} onChange={v => onChange((panel: Panel) => {
                panel.plugins.text.fontSize = v
            })} />
        </PanelEditItem>

        <PanelEditItem title="Font weight">
            <EditorInputItem value={panel.plugins.text.fontWeight} onChange={v => onChange((panel: Panel) => {
                panel.plugins.text.fontWeight = v
            })} />
        </PanelEditItem>
    </PanelAccordion>
    )
})

export default TextPanelEditor