import { Box, Center, Select, useColorMode, useColorModeValue, useToast } from "@chakra-ui/react"
import { DefaultColumnFilter, NumberRangeColumnFilter } from "components/table/filters"
import ReactTable from "components/table/Table"
import { setVariable } from "src/views/variables/Variables"
import React, { useEffect, useMemo } from "react"
import { PanelProps } from "types/dashboard"
import { TablePluginData, TableSeries } from "types/plugins/table"
import { isEmpty, isFunction, isNumber } from "lodash"
import { genDynamicFunction } from "utils/dynamicCode"
import { useNavigate } from "react-router-dom"

interface TablePanelProps extends PanelProps {
    data: TablePluginData[]
}

const TablePanel = (props: TablePanelProps) => {
    if (isEmpty(props.data)) {
        return (<Center height="100%">No data</Center>)
    }
    const navigate = useNavigate()
    const toast = useToast()
    const [series, setSeries] = React.useState(props.data[0][0].name)

    // because panel may have multiple queries, each query return a TablePluginData
    // so we need to flatten TablePluginData[] into TablePluginData


    const [tableColumns, tableData, seriesList] = useMemo(() => {
        const data:TableSeries[] = []
        const seriesList = []
        let exist = false
        props.data.forEach(d => {
            d.forEach(s => {
                if (s.name == series) {
                    exist = true
                }
                seriesList.push(s.name)
                data.push(s)
            })
        })

        for (var i = 0; i < data.length; i++) {
            const s = data[i]

            if (!exist || s.name == series) {
                if (!exist) {
                    setSeries(s.name)
                }
                const columns = []
                s.columns?.forEach((column, i) => {
                    if (column.canFilter) {
                        if (isNumber(s.rows[0][column.Header])) {
                            columns.push({
                                Header: column.Header,
                                accessor: column.Header,
                                Filter: NumberRangeColumnFilter,
                                filter: 'between',
                            })
                        } else {
                            columns.push({
                                Header: column.Header,
                                accessor: column.Header,
                                Filter: DefaultColumnFilter,
                            })
                        }

                    } else {
                        columns.push({
                            Header: column.Header,
                            accessor: column.Header,
                        })
                    }
                })

                return [columns, s.rows,seriesList]
            }
        }

        return [[], [], seriesList]
    }, [series, props.data])

    const clickFunc = genDynamicFunction(props.panel.plugins.table.onRowClick);


    return (
        <Box h="100%">
            <Box maxH={series ? "calc(100% - 32px)" : "100%"} overflowY="scroll" sx={cssStyles}>
                <ReactTable
                    columns={tableColumns}
                    data={tableData}
                    enableGlobalSearch={props.panel.plugins.table.globalSearch}
                    enablePagination={props.panel.plugins.table.enablePagination}
                    pageSize={props.panel.plugins.table.pageSize}
                    enableFilter={props.panel.plugins.table.enableFilter}
                    enableSort={props.panel.plugins.table.enableSort}
                    showHeader={props.panel.plugins.table.showHeader}
                    onRowClick={clickFunc ? (row) => {
                        if (!isFunction(clickFunc)) {
                            toast({
                                title: "Error",
                                description: "The row click function you defined is not valid",
                                status: "error",
                                duration: 9000,
                                isClosable: true,
                            })
                        } else {
                            clickFunc(row, navigate, (k, v) => setVariable(k, v, toast))
                        }
                    } : null}
                />

            </Box>
            {series && <Select mt="1" size="sm" onChange={e => setSeries(e.currentTarget.value)}>
                {seriesList.map(series => {
                    return <option key={series} value={series}>{series}</option>
                })}
            </Select>}
        </Box>

    )
}

export default TablePanel


const cssStyles = {
    '.chakra-table thead tr th input': {
        background: 'transparent',
        outline: "none"
    },
    '.pagination': {
        input: {
            background: 'transparent',
            outline: "none"
        }
    }
}