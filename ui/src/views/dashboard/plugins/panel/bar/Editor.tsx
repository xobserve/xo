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
import { Switch, Textarea } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, textPanelMsg } from "src/i18n/locales/en"

const BarPanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title="Show grid">
                <Switch defaultChecked={panel.plugins.bar.showGrid} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.bar.showGrid = e.currentTarget.checked
                })} />
            </PanelEditItem>

            <PanelEditItem title="Tooltip">
                <RadionButtons options={[{ label: "Single", value: "single" }, { label: "All", value: "all" }, { label: "None", value: "none" }]} value={panel.plugins.bar.tooltip} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.bar.tooltip = v
                })} />
            </PanelEditItem>

            <PanelEditItem title="Show label" desc="Value label display on bars">
                <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: 'always' }, { label: "None", value: 'none' }]} value={panel.plugins.bar.showLabel} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.bar.showLabel = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Stack">
                <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: 'always' }, { label: "None", value: 'none' }]} value={panel.plugins.bar.stack} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.bar.stack = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.styles}>

        </PanelAccordion>
    </>
    )
})

export default BarPanelEditor