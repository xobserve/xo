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
import { Box, Center, Flex, Select } from "@chakra-ui/react"
import React, {  useMemo } from "react"
import { PanelProps } from "types/dashboard"
import { TablePluginData, TableSeries } from "types/plugins/table"
import { cloneDeep, isEmpty } from "lodash"
import ComplexTable from "./components/ComplexTable/ComplexTable"

interface TablePanelProps extends PanelProps {
    data: TablePluginData[]
}

const TablePanel = (props: TablePanelProps) => {
    const {panel} = props
    if (isEmpty(props.data)) {
        return (<Center height="100%">No data</Center>)
    }

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
                data.push(cloneDeep(s))
            })
        })

        for (var i = 0; i < data.length; i++) {
            const s = data[i]

            if (!exist || s.name == series) {
                if (!exist) {
                    setSeries(s.name)
                }
                return [s.columns, s.rows,seriesList]
            }
        }

        return [[], [], seriesList]
    }, [series, props.data, props.panel.overrides,panel.enableTransform])

    return (
        <Flex h="100%" justify="space-between" direction="column">
            <Box maxH={series ? "calc(100% - 32px)" : "100%"} overflowY="scroll" sx={cssStyles}>
                <ComplexTable panel={props.panel} dashboardId={props.dashboardId} columns={tableColumns} data={tableData} />
            </Box>
            {series && <Select mt="1" size="sm" onChange={e => setSeries(e.currentTarget.value)}>
                {seriesList.map(series => {
                    return <option key={series} value={series}>{series}</option>
                })}
            </Select>}
        </Flex>

    )
}

export default TablePanel


const cssStyles = {
    '.ant-table-wrapper': {
        maxWidth: 'calc(100% - 1px) !important'
    },
    'td.ant-table-cell': {
        padding: '0 0 !important'
    },
    'th.ant-table-cell': {
        background: "inherit !important"
    },
    '.chakra-table thead tr th input': {
        background: 'transparent',
        outline: "none"
    },
    '.pagination': {
        input: {
            background: 'transparent',
            outline: "none"
        }
    },
    '.ant-table-wrapper .ant-table-tbody >tr >td': {
      borderBottomWidth: '0.5px'
    }
}