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
import { EditorInputItem, EditorNumberItem } from "src/components/editor/EditorItem"
import RadionButtons from "src/components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import React, { memo, useState } from "react";
import { useStore } from "@nanostores/react"
import { textPanelMsg } from "src/i18n/locales/en"
import { PanelType, DatavLogEditorProps, DatavLogPanel as Panel } from "./types"
import CodeEditor from "components/CodeEditor/CodeEditor"
import { locale } from "src/i18n/i18n";
import { Switch, useToast } from "@chakra-ui/react";
import StringColorMappingEditor from "../../../components/StringColorMapping";
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";

const PanelEditor = memo(({ panel, onChange }: DatavLogEditorProps) => {
    let lang = useStore(locale)
    const toast = useToast()
    const [columns, setColumns] = useState(JSON.stringify(panel.plugins[PanelType].columns.displayColumns, null, 4))
    return (<>
        <PanelAccordion title={lang == "en" ? "Log basic settings" : "日志基本设置"}>
            <PanelEditItem title={lang == "en" ? "Show bar chart" : "显示柱状图"}>
                <Switch defaultChecked={panel.plugins[PanelType].showChart} onChange={e => onChange((panel: Panel) => {
                    panel.plugins[PanelType].showChart = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={lang == "en" ? "Show logs" : "显示日志列表"}>
                <Switch defaultChecked={panel.plugins[PanelType].showLogs} onChange={e => onChange((panel: Panel) => {
                    panel.plugins[PanelType].showLogs = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={lang == "en" ? "Show search" : "显示搜索栏"}>
                <Switch defaultChecked={panel.plugins[PanelType].showSearch} onChange={e => onChange((panel: Panel) => {
                    panel.plugins[PanelType].showSearch = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={lang == "en" ? "Column fontsize" : "列标题字体大小"}>
                <EditorNumberItem value={panel.plugins[PanelType].headerFontSize} onChange={v => onChange((panel: Panel) => {
                    panel.plugins[PanelType].headerFontSize = v
                })} step={0.5} min={8} max={20} />
            </PanelEditItem>
            <PanelEditItem title={lang == "en" ? "Log font size" : "日志字体大小"}>
                <EditorNumberItem value={panel.plugins[PanelType].logFontSize} onChange={v => onChange((panel: Panel) => {
                    panel.plugins[PanelType].logFontSize = v
                })} step={0.5} min={8} max={20} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={lang == "en" ? "Log row" : "日志行"}>
            <PanelEditItem title={lang == "en" ? "Wrap line" : "换行"}>
                <Switch defaultChecked={panel.plugins[PanelType].logline.wrapLine} onChange={e => onChange((panel: Panel) => {
                    panel.plugins[PanelType].logline.wrapLine = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={lang == "en" ? "Overflow" : "显示完整行"}>
                <Switch defaultChecked={panel.plugins[PanelType].logline.allowOverflow} onChange={e => onChange((panel: Panel) => {
                    panel.plugins[PanelType].logline.allowOverflow = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={lang == "en" ? "Columns" : "日志列"}>
            <PanelEditItem title={lang == "en" ? "Display columns" : "显示指定的列"}>
                <CodeEditor height="300px" language="json" value={columns} onChange={v => onChange((panel: Panel) => {
                    setColumns(v)
                })} onBlur={() => {

                    onChange((panel: Panel) => {
                        try {
                            panel.plugins[PanelType].columns.displayColumns = JSON.parse(columns)
                        } catch (error) {
                            toast({
                                title: "Error",
                                description: "Invalid JSON",
                                status: "error",
                                duration: 3000,
                            })
                        }
                    })

                }} />
            </PanelEditItem>
            <PanelEditItem title={lang == "en" ? "Highlight column values" : "高亮显示列的值"} desc={`columnName=regexp e.g: body=.*customer.*  resources.container_name=hotrod`}>
                <StringColorMappingEditor value={panel.plugins[PanelType].columns.highlight} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins[PanelType].columns.highlight = v
                })} tips="Render column value with specify color" />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={"Chart"}>
            <PanelEditItem title={lang == "en" ? "Type" : "图表类型"}>
                <RadionButtons options={[{ label: "Bar", value: "bar" }, { label: "Line", value: "line" }]} value={panel.plugins[PanelType].chart.type} onChange={v => onChange((panel: Panel) => {
                    panel.plugins[PanelType].chart.type = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={lang == "en" ? "Height" : "图表高度"}>
                <EditorNumberItem value={panel.plugins[PanelType].chart.height} onChange={v => onChange((panel: Panel) => {
                    panel.plugins[PanelType].chart.height = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} step={10} min={0} max={1000} />
            </PanelEditItem>
            <PanelEditItem title={"Stack"}>
                <Switch defaultChecked={panel.plugins[PanelType].chart.stack} onChange={e => onChange((panel: Panel) => {
                    panel.plugins[PanelType].chart.stack = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Top"}>
                <EditorNumberItem value={panel.plugins[PanelType].chart.top} onChange={v => onChange((panel: Panel) => {
                    panel.plugins[PanelType].chart.top = v
                })} step={1} min={0} max={100} /> %
            </PanelEditItem>
            <PanelEditItem title={"Right"}>
                <EditorNumberItem value={panel.plugins[PanelType].chart.right} onChange={v => onChange((panel: Panel) => {
                    panel.plugins[PanelType].chart.right = v
                })} step={1} min={0} max={100} /> %
            </PanelEditItem>
            <PanelEditItem title={"Bottom"}>
                <EditorNumberItem value={panel.plugins[PanelType].chart.bottom} onChange={v => onChange((panel: Panel) => {
                    panel.plugins[PanelType].chart.bottom = v
                })} step={1} min={0} max={100} /> %
            </PanelEditItem>
            <PanelEditItem title={"Left"}>
                <EditorNumberItem value={panel.plugins[PanelType].chart.left} onChange={v => onChange((panel: Panel) => {
                    panel.plugins[PanelType].chart.left = v
                })} step={1} min={0} max={100} /> %
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
})

export default PanelEditor

