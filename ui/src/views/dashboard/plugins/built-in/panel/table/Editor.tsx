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
import { Box, Button, HStack, Modal, ModalBody, ModalContent, ModalOverlay,  Select, Switch, Text, useDisclosure, useTheme, VStack } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import { EditorInputItem, EditorNumberItem } from "src/components/editor/EditorItem"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import CodeEditor from "src/components/CodeEditor/CodeEditor"
import { memo, useState } from "react"
import React from "react";
import RadionButtons from "src/components/RadioButtons"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"
import { useStore } from "@nanostores/react"
import { commonMsg, tablePanelMsg } from "src/i18n/locales/en"
import { ClickActionsEditor } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import { ColorPicker } from "src/components/ColorPicker"
import { TableEditorProps, TablePanel as Panel } from "./types"

const TablePanelEditor = memo(({ panel, onChange }: TableEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(tablePanelMsg)
    return (<>
        <PanelAccordion title={t1.tableSetting}>
            <PanelEditItem title={t1.showHeader} desc={t1.showHeaderTips}>
                <Switch isChecked={panel.plugins.table.showHeader} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.showHeader = e.target.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.showBorder}>
                <Switch isChecked={panel.plugins.table.bordered} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.bordered = e.target.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.stickyHeader} desc={t1.stickyHeaderTips}>
                <Switch isChecked={panel.plugins.table.stickyHeader} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.stickyHeader = e.target.checked
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>

            <PanelEditItem title={t1.cellSize}>
                <RadionButtons options={[{ label: t.small, value: "small" }, { label: t.medium, value: "middle" }, { label: t.large, value: "large" }]} value={panel.plugins.table.cellSize} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.table.cellSize = v
                })} />
            </PanelEditItem>

            <PanelEditItem title={t1.tableWidth}>
                <HStack><EditorNumberItem value={panel.plugins.table.tableWidth} min={100} step={20} onChange={
                    (v) => onChange((panel: Panel) => {
                        panel.plugins.table.tableWidth = v
                    })
                } /> <Text textStyle="annotation">%</Text></HStack>
            </PanelEditItem>
            <PanelEditItem title={t.pagination}>
                <Switch isChecked={panel.plugins.table.enablePagination} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.enablePagination = e.target.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t1.column}>
            <PanelEditItem title={t1.colorTitle}>
                <ColorPicker color={panel.plugins.table.column.colorTitle} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.table.column.colorTitle = v
                })} />
            </PanelEditItem>

            <PanelEditItem title={t1.columnAlignment}>
                <RadionButtons options={[{ label: t.auto, value: "auto" }, { label: t.left, value: "left" }, { label: t.center, value: "center" }, { label: t.right, value: "right" }]} value={panel.plugins.table.column.align} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.table.column.align = v
                })} />
            </PanelEditItem>

            <PanelEditItem title={t1.columnSort} desc={t1.columnSortTips}>
                <Switch isChecked={panel.plugins.table.column.enableSort} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.column.enableSort = e.target.checked
                })} />
            </PanelEditItem>


            <PanelEditItem title={t1.columnFilter} desc={t1.columnFilterTips}>
                <Switch isChecked={panel.plugins.table.column.enableFilter} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.column.enableFilter = e.target.checked
                })} />
            </PanelEditItem>

        </PanelAccordion>

        <PanelAccordion title={t.interaction}>
            <PanelEditItem title="Enable row click">
                <Switch isChecked={panel.plugins.table.enableRowClick} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.enableRowClick = e.target.checked
                })} />
            </PanelEditItem>
            <OnRowClickEditor panel={panel} onChange={v => {
                onChange((panel: Panel) => {
                    panel.plugins.table.onRowClick = v
                })
            }} />

            <ClickActionsEditor panel={panel} onChange={v => {
                onChange((panel: Panel) => {
                    panel.plugins.table.rowActions = v
                })
            }} actions={panel.plugins.table.rowActions}/>
            {panel.plugins.table.rowActions.length > 0 && <>
                <PanelEditItem title={t1.actionColumnName}>
                    <EditorInputItem value={panel.plugins.table.actionColumnName} placeholder="default to Action when leave empty" onChange={
                        (v) => onChange((panel: Panel) => {
                            panel.plugins.table.actionColumnName = v
                        })
                    } />
                </PanelEditItem>
                <PanelEditItem title={t1.actionColumnWidth}>
                    <EditorInputItem value={panel.plugins.table.actionClumnWidth} placeholder="css width, e.g 100px, 20%" onChange={
                        (v) => onChange((panel: Panel) => {
                            panel.plugins.table.actionClumnWidth = v
                        })
                    } />
                </PanelEditItem>
                <PanelEditItem title={t1.actionButtonSize}>
                    <RadionButtons options={[{ label: "xs", value: "xs" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }]} value={panel.plugins.table.actionButtonSize} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.table.actionButtonSize = v
                    })} />
                </PanelEditItem>
            </>}
        </PanelAccordion>
    </>
    )
})

export default TablePanelEditor



const OnRowClickEditor = ({ panel, onChange }: TableEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(tablePanelMsg)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useState(panel.plugins.table.onRowClick)

    const onSubmit = () => {
        onChange(temp)
        onClose()
    }


    return (<>
        <PanelEditItem title={t1.onRowClick} desc={t1.onRowClickTips}>
            <Button size="sm" onClick={onOpen}>{t.edit}</Button>
        </PanelEditItem>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="800px" height="500px">
                <ModalBody p="0">
                    <CodeEditor value={temp} onChange={v => setTemp(v)} />
                </ModalBody>
                <Button onClick={onSubmit}>{t.submit}</Button>
            </ModalContent>
        </Modal>
    </>
    )
}
