import { Alert, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Switch, Text, Textarea } from "@chakra-ui/react"
import PanelAccordion from "components/dashboard/edit-panel/Accordion"
import PanelEditItem from "components/dashboard/edit-panel/PanelEditItem"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { Panel } from "types/dashboard"

interface Props {
    panel: Panel
    onChange: any
}

const TablePanelEditor = ({ panel, onChange }: Props) => {
    const [tempPanel, setTempPanel] = useState<Panel>(panel)

    return (<PanelAccordion title="Table setting">
        <PanelEditItem title="Show header" desc="whether display table's header">
            <Switch isChecked={tempPanel.settings.table.showHeader ?? true} onChange={(e) => {
                tempPanel.settings.table.showHeader = e.target.checked
                setTempPanel(cloneDeep(tempPanel))
                onChange(tempPanel)
            }} />
        </PanelEditItem>

        <PanelEditItem title="Global search" desc="Enable search for this table, you can search everything">
            <Switch isChecked={tempPanel.settings.table.globalSearch} onChange={(e) => {
                tempPanel.settings.table.globalSearch = e.target.checked
                setTempPanel(cloneDeep(tempPanel))
                onChange(tempPanel)
            }} />
        </PanelEditItem>
        <PanelEditItem title="Pagination">
            <Switch isChecked={tempPanel.settings.table.enablePagination} onChange={(e) => {
                tempPanel.settings.table.enablePagination = e.target.checked
                setTempPanel(cloneDeep(tempPanel))
                onChange(tempPanel)
            }} />
        </PanelEditItem>
        {tempPanel.settings.table.enablePagination && <PanelEditItem title="Page size" desc="set display count for each table page">
            <NumberInput value={tempPanel.settings.table.pageSize ?? 10} min={5} max={20} step={5} onChange={(v) => {
                tempPanel.settings.table.pageSize = Number(v)
                setTempPanel(cloneDeep(tempPanel))
                onChange(tempPanel)
            }
            }>
                <NumberInputField disabled />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </PanelEditItem>}

        <PanelEditItem title="Column sort" desc="click the column title to sort it by asc or desc">
            <Switch isChecked={tempPanel.settings.table.enableSort} onChange={(e) => {
                tempPanel.settings.table.enableSort = e.target.checked
                setTempPanel(cloneDeep(tempPanel))
                onChange(tempPanel)
            }} />
        </PanelEditItem>

        <PanelEditItem title="Column filter" desc="filter the column values in table">
            <Switch isChecked={tempPanel.settings.table.enableFilter} onChange={(e) => {
                tempPanel.settings.table.enableFilter = e.target.checked
                setTempPanel(cloneDeep(tempPanel))
                onChange(tempPanel)
            }} />
        </PanelEditItem>

        <PanelEditItem title="On row click" desc="trigger your custom event when a row is clicked">
            <Alert status='success'>
                Here is a simple example:
                
            </Alert>
            <Text>function onRowClick(row) &#123;</Text>
            <Textarea value={tempPanel.settings.table.onRowClick} onChange={(e) => {
                tempPanel.settings.table.onRowClick = e.currentTarget.value
                setTempPanel(cloneDeep(tempPanel))
            }}
             onBlur={() => {
                onChange(tempPanel)
                
                }} />
             <Text>&#125; </Text>
        </PanelEditItem>
    </PanelAccordion>
    )
}

export default TablePanelEditor