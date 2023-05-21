import { Box, Select } from "@chakra-ui/react"
import { NumberRangeColumnFilter } from "components/table/filters"
import ReactTable from "components/table/Table"
import React from "react"
import { Panel, PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"
import makeData from './makeData'



const TablePanel = (props: PanelProps) => {
    console.log(props)
    const columns = React.useMemo(
        () => [
            {
                Header: 'First Name',
                accessor: 'firstName',
            },
            {
                Header: 'Last Name',
                accessor: 'lastName',
                // Use our custom `fuzzyText` filter on this column
                filter: 'fuzzyText',
            },
            {
                Header: 'Age',
                accessor: 'age',
                Filter: NumberRangeColumnFilter,
                filter: 'between',
            },
            {
                Header: 'Visits',
                accessor: 'visits',
                Filter: NumberRangeColumnFilter,
                filter: 'between',
            },
            {
                Header: 'Status',
                accessor: 'status',
            },
            {
                Header: 'Profile Progress',
                accessor: 'progress',
            },
        ],
        []
    )


    const data = React.useMemo(() => makeData(100), [])

    return (
        <Box h="100%">
            <Box h="calc(100% - 32px)" overflowY="scroll">
                <ReactTable
                    columns={columns}
                    data={data}
                    enableGlobalSearch={props.panel.settings.table.globalSearch}
                    enablePagination={props.panel.settings.table.enablePagination}
                    pageSize={props.panel.settings.table.pageSize}
                    enableFilter={props.panel.settings.table.enableFilter}
                    enableSort={props.panel.settings.table.enableSort}
                    showHeader={props.panel.settings.table.showHeader}
                />

            </Box>
            <Select size="sm">
                {props.data.map((dataFrame: DataFrame) => {
                    return <option key={dataFrame.name} value={dataFrame.name}>{dataFrame.name}</option>
                })}
            </Select></Box>

    )
}

export default TablePanel


