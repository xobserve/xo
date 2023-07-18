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
import { Alert, Box, Button, HStack, Modal, ModalBody, ModalContent, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Switch, Text, Textarea, useDisclosure } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import CodeEditor from "components/CodeEditor/CodeEditor"
import { useState } from "react"
import React from "react";
import RadionButtons from "components/RadioButtons"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"

const TablePanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<>
        <PanelAccordion title="Table setting">
            <PanelEditItem title="Show header" desc="whether display table's header">
                <Switch isChecked={panel.plugins.table.showHeader} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.showHeader = e.target.checked
                })} />
            </PanelEditItem>

            <PanelEditItem title="Sticky header" desc="fix header to top, useful for viewing many rows in one page">
                <Switch isChecked={panel.plugins.table.stickyHeader} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.stickyHeader = e.target.checked
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>

            <PanelEditItem title="Cell size">
                <RadionButtons options={[{ label: "Small", value: "small" }, { label: "Medium", value: "middle" }, { label: "Large", value: "large" }]} value={panel.plugins.table.cellSize} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.table.cellSize = v
                })} />
            </PanelEditItem>

            <PanelEditItem title="Table width">
                <HStack><EditorNumberItem value={panel.plugins.table.tableWidth} min={100} step={20} onChange={
                    (v) => onChange((panel: Panel) => {
                        panel.plugins.table.tableWidth = v
                    })
                } /> <Text textStyle="annotation">%</Text></HStack>
            </PanelEditItem>
            <PanelEditItem title="Cell size">
                <RadionButtons options={[{ label: "Small", value: "small" }, { label: "Medium", value: "middle" }, { label: "Large", value: "large" }]} value={panel.plugins.table.cellSize} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.table.cellSize = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Pagination">
                <Switch isChecked={panel.plugins.table.enablePagination} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.enablePagination = e.target.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Column">
            <PanelEditItem title="Column alignment">
                <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Left", value: "left" }, { label: "Center", value: "center" },{ label: "Right", value: "right" }]} value={panel.plugins.table.column.align} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.table.column.align = v
                })} />
            </PanelEditItem>

            <PanelEditItem title="Column sort" desc="click the column title to sort it by asc or desc">
                <Switch isChecked={panel.plugins.table.column.enableSort} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.column.enableSort = e.target.checked
                })} />
            </PanelEditItem>


            <PanelEditItem title="Column filter" desc="filter the column values in table">
                <Switch isChecked={panel.plugins.table.column.enableFilter} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.column.enableFilter = e.target.checked
                })} />
            </PanelEditItem>
            {/* <PanelEditItem title="Global search" desc="Enable search for this table, you can search everything">
                <Switch isChecked={panel.plugins.table.globalSearch} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.table.globalSearch = e.target.checked
                })} />
            </PanelEditItem>





            <OnRowClickEditor panel={panel} onChange={v => {
                onChange((panel: Panel) => {
                    panel.plugins.table.onRowClick = v
                })
            }} /> */}
        </PanelAccordion>
    </>
    )
}

export default TablePanelEditor



const OnRowClickEditor = ({ panel, onChange }: PanelEditorProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useState(panel.plugins.table.onRowClick)

    const onSubmit = () => {
        onChange(temp)
        onClose()
    }


    return (<>
        <PanelEditItem title="On row click" desc="trigger your custom event when a row is clicked">
            <Button size="sm" onClick={onOpen}>Edit</Button>
        </PanelEditItem>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="800px" height="500px">
                <ModalBody p="0">
                    <CodeEditor value={temp} onChange={v => setTemp(v)} />
                </ModalBody>
                <Button onClick={onSubmit}>Submit</Button>
            </ModalContent>
        </Modal>
    </>
    )
}