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
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo, useMemo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"
import { LogSeries } from "types/plugins/log"
import { Select } from "antd"
import { LayoutOrientation } from "types/layout"
import { ColorPicker } from "components/ColorPicker"

const LogPanelEditor = memo((props: PanelEditorProps) => {
    const { panel, onChange } = props
    const data: LogSeries[] = props.data?.flat() ?? []
    const labels = useMemo(() => {
        const labels = new Set<string>()
        data.forEach(series => {
            Object.keys(series.labels).forEach(k => {
                labels.add(k)
            })
        })
        return Array.from(labels).sort()
    }, [props.data])

    const t = useStore(commonMsg)
    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title="Show time">
                <Switch isChecked={panel.plugins.log.showTime} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.log.showTime = e.target.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Timestamp column width" desc="In css pixels">
                <EditorNumberItem min={0} max={500} step={5} value={panel.plugins.log.timeColumnWidth} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.log.timeColumnWidth = v
                })} placeholder="auto" />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Labels">
            <PanelEditItem title="Display labels">
                <Select mode="multiple" value={panel.plugins.log.labels.display} options={labels.map(l => ({ label: l, value: l }))} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.log.labels.display = v
                })} popupMatchSelectWidth={false} style={{ width: '100%' }} placeholder="select labels.." allowClear showSearch />
            </PanelEditItem>
            <PanelEditItem title="Label column width" desc="In css pixels">
                <EditorNumberItem min={0} max={1000} step={5} value={panel.plugins.log.labels.width} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.log.labels.width = v
                })} placeholder="auto" />
            </PanelEditItem>
            <PanelEditItem title="Layout orientation">
                <RadionButtons options={[{ label: LayoutOrientation.Horizontal, value: LayoutOrientation.Horizontal }, { label: LayoutOrientation.Vertical, value: LayoutOrientation.Vertical }]} value={panel.plugins.log.labels.layout} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.log.labels.layout = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.styles}>
            <PanelEditItem title="Label name color">
                <ColorPicker color={panel.plugins.log.styles.labelColor} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.log.styles.labelColor = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Label value color">
                <ColorPicker color={panel.plugins.log.styles.labelValueColor} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.log.styles.labelValueColor = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Content color">
                <ColorPicker color={panel.plugins.log.styles.contentColor} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.log.styles.contentColor = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Font size" desc="Css style font-size">
                <EditorInputItem value={panel.plugins.log.styles.fontSize} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.log.styles.fontSize = v
                })} placeholder="e.g 1rem, 16px" />
            </PanelEditItem>
            <PanelEditItem title="Wrap line" desc="Css style word-break">
                <RadionButtons options={[{ label: "Break All", value: "break-all" },{ label: "Break Word", value: 'break-word' }]} value={panel.plugins.log.styles.wordBreak} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.log.styles.wordBreak = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
})

export default LogPanelEditor