import { Box, Select } from "@chakra-ui/react"
import { NumberRangeColumnFilter } from "components/table/filters"
import ReactTable from "components/table/Table"
import React, { useEffect } from "react"
import { Panel, PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"
import makeData from './makeData'



const TablePanel = (props: PanelProps) => {
    console.log(props)
    const [series, setSeries] = React.useState(null)

    useEffect(() => {
        if (props.data.length > 0) {
            const series = props.data[0].name
            setSeries(series)
        }
    },[props.data])

    const [columns,data] = React.useMemo(() => { 
        const data = []
        const columns = []
        for (var i=0;i<props.data.length;i++) {
            const row = props.data[i]
            if (row.name == series) {
                row.fields.forEach((field) => {
                    if (field.type == "number" || field.type == "time") {
                        columns.push({
                            Header: field.name,
                            accessor: field.name,
                            Filter: NumberRangeColumnFilter,
                            filter: 'between',
                        })
                    } else {
                        columns.push({
                            Header: field.name,
                            accessor: field.name,
                        })
                    }
                    
                  })
                  
               for (var j=0;j<row.fields[0].values.length;j++) {
                  const d = {}
                  let c;

                 
                  row.fields.forEach((field) => {
                    d[field.name] = field.values[j]
                  })

                  data.push(d)
                
               }

               return [columns,data]
               
            }
        }
  
       return [[],[]]
    }, [series])

    return (
        <Box h="100%">
            <Box h= {series ? "calc(100% - 32px)" : "100%"} overflowY="scroll">
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
            {series && <Select size="sm" onChange={e => setSeries(e.currentTarget.value)}>
                {props.data.map((dataFrame: DataFrame) => {
                    return <option key={dataFrame.name} value={dataFrame.name}>{dataFrame.name}</option>
                })}
            </Select>}
        </Box>

    )
}

export default TablePanel


