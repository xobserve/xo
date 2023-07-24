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
import { Alert, Box, Button, HStack, Modal, ModalBody, ModalContent, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Select, Switch, Text, Textarea, useDisclosure, useTheme, VStack } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import CodeEditor from "components/CodeEditor/CodeEditor"
import { useMemo, useState } from "react"
import React from "react";
import RadionButtons from "components/RadioButtons"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"
import { onClickCommonEvent } from "src/data/panel/initPlugins"
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal"
import { FaTimes } from "react-icons/fa"
import { getColorThemeValues } from "utils/theme"
import { useStore } from "@nanostores/react"
import { commonMsg, tablePanelMsg } from "src/i18n/locales/en"

const TablePanelEditor = ({ panel, onChange }: PanelEditorProps) => {
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
                <Switch isChecked={panel.plugins.table.column.colorTitle} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.column.colorTitle = e.target.checked
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
            <OnRowClickEditor panel={panel} onChange={v => {
                onChange((panel: Panel) => {
                    panel.plugins.table.onRowClick = v
                })
            }} />

            <RowActionsEditor panel={panel} onChange={v => {
                onChange((panel: Panel) => {
                    panel.plugins.table.rowActions = v
                })
            }} />
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
}

export default TablePanelEditor



const OnRowClickEditor = ({ panel, onChange }: PanelEditorProps) => {
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

const RowActionsEditor = ({ panel, onChange }: PanelEditorProps) => {
    const t1 = useStore(tablePanelMsg)
    const theme = useTheme()
    const colors = useMemo(() => {
        return getColorThemeValues(theme).map(c => <option key={c} value={c}>{c}</option>)
    }, [theme])

    const addAction = () => {
        onChange([{ name: "New action", action: onClickCommonEvent, style: "solid", color: "brand" }, ...panel.plugins.table.rowActions])
    }

    const removeAction = (index: number) => {
        onChange(panel.plugins.table.rowActions.filter((_, i) => i !== index))
    }

    return (<PanelEditItem title={t1.rowActions} desc={t1.rowActionsTips}>
        <Button size="sm" colorScheme="gray" width="100%" onClick={addAction}>{t1.addAction}</Button>
        <VStack alignItems="left" mt="2" key={panel.plugins.table.rowActions.length}>
            {
                panel.plugins.table.rowActions.map((action, index) => <HStack key={index}>
                    <Box width="140px"><EditorInputItem size="sm" placeholder="Action name" value={action.name} onChange={v => {
                        action.name = v
                        onChange([...panel.plugins.table.rowActions])
                    }} /></Box>
                    <CodeEditorModal value={action.action} onChange={v => {
                        action.action = v
                        onChange([...panel.plugins.table.rowActions])
                    }} />
                    <Select width="80px" size="sm" variant="unstyled" value={action.style} onChange={e => {
                        action.style = e.target.value
                        onChange([...panel.plugins.table.rowActions])
                    }}>
                        <option value="solid">Solid</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                    </Select>
                    <Select width="140px" size="sm" variant="unstyled" value={action.color} onChange={e => {
                        action.color = e.target.value
                        onChange([...panel.plugins.table.rowActions])
                    }}>
                        {colors}
                    </Select>
                    <FaTimes className="action-icon" cursor="pointer" onClick={() => removeAction(index)} />
                </HStack>)
            }
        </VStack>
    </PanelEditItem>)
}
