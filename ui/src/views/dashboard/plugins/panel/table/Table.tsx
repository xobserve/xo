import { Box, Select, useToast } from "@chakra-ui/react"
import { DefaultColumnFilter, NumberRangeColumnFilter } from "components/table/filters"
import ReactTable from "components/table/Table"
import { setVariable } from "src/views/variables/Variables"
import { useRouter } from "next/router"
import React, { useEffect, useMemo } from "react"
import { PanelProps } from "types/dashboard"
import { TablePluginData } from "types/plugins/table"
import { isNumber } from "lodash"

interface TablePanelProps extends PanelProps {
    data: TablePluginData[]
}

const TablePanel = (props: TablePanelProps) => {
    // because panel may have multiple queries, each query return a TablePluginData
    // so we need to flatten TablePluginData[] into TablePluginData
    const data = useMemo(() => {
        const res = []
        props.data.forEach(d => {
            d.forEach(d1 => {
                res.push(d1)
            })
        })
        return res
    },[props.data])

    

    const router = useRouter()
    const toast = useToast()
    const [series, setSeries] = React.useState(null)

    useEffect(() => {
        if (props.data.length > 0) {
            const series = props.data[0][0].name
            setSeries(series)
        }
    },[props.data])
    


    const [tableColumns,tableData] = useMemo(() => { 
  
        for (var i=0;i<props.data[0].length;i++) {
            const s = props.data[0][i]
            if (s.name == series) {
                const columns = []
                s.columns.forEach((column,i) => {
                    if (column.canFilter) {
                        if (!isNumber(s.rows[0][column.Header])) {
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

                return [columns, s.rows]
            }
        }
  
       return [[],[]]
    }, [props.data,series])

    const onRowClickFunc = new Function("row,router,setVariable", props.panel.plugins.table.onRowClick)

    return (
        <Box h="100%">
            <Box h= {series ? "calc(100% - 32px)" : "100%"} overflowY="scroll">
                <ReactTable
                    columns={tableColumns}
                    data={tableData}
                    enableGlobalSearch={props.panel.plugins.table.globalSearch}
                    enablePagination={props.panel.plugins.table.enablePagination}
                    pageSize={props.panel.plugins.table.pageSize}
                    enableFilter={props.panel.plugins.table.enableFilter}
                    enableSort={props.panel.plugins.table.enableSort}
                    showHeader={props.panel.plugins.table.showHeader}
                    onRowClick={onRowClickFunc ? (row) => onRowClickFunc(row, router,(k,v) => setVariable(k,v,toast)) : null}
                />

            </Box>
            {series && <Select size="sm" onChange={e => setSeries(e.currentTarget.value)}>
                {data.map(series => {
                    return <option key={series.name} value={series.name}>{series.name}</option>
                })}
            </Select>}
        </Box>

    )
}

export default TablePanel


