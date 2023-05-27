import { Box, Select, useToast } from "@chakra-ui/react"
import { NumberRangeColumnFilter } from "components/table/filters"
import ReactTable from "components/table/Table"
import { setVariableValue } from "components/variables/SelectVariables"
import { useRouter } from "next/router"
import React, { useEffect } from "react"
import { Dashboard, Panel, PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"
import { Variable } from "types/variable"

const TablePanel = (props: PanelProps) => {
    const router = useRouter()
    const toast = useToast()
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
    }, [props.data,series])

    const onRowClickFunc = new Function("row,router,setVariable", props.panel.settings.table.onRowClick)

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
                    onRowClick={onRowClickFunc ? (row) => onRowClickFunc(row, router,(k,v) => setVariable(props.variables,k,v,toast)) : null}
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

const setVariable = (variables: Variable[],name,value,toast) => {
    let v;
    for (var i=0;i<variables.length;i++) {
        if (variables[i].name == name) {
            v = variables[i]
            break
        }
    }

    const err = setVariableValue(v,value )
    if (err) {
        toast({
            title: "On row click error",
            description: err,
            status: "warning",
            duration: 9000,
            isClosable: true,
        })
    }
}
