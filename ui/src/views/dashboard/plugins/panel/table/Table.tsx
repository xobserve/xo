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
import { Box, Center, Flex, Select, useColorMode } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { PanelProps } from "types/dashboard"
import { TableSeries } from "types/plugins/table"
import { isEmpty } from "lodash"
import ComplexTable from "./components/ComplexTable/ComplexTable"
import { SeriesData } from "types/seriesData"
import customColors from "theme/colors"

interface TablePanelProps extends PanelProps {
    data: SeriesData[][]
}

const TablePanel = (props: TablePanelProps) => {
    const {colorMode} = useColorMode()
    const { panel } = props
    if (isEmpty(props.data)) {
        return (<Center height="100%">No data</Center>)
    }

    const tdata: TableSeries[] = seriesDataToTableData(props.data)
    const [series, setSeries] = React.useState(tdata[0].name)

    // because panel may have multiple queries, each query return a TablePluginData
    // so we need to flatten TablePluginData[] into TablePluginData

    const [tableColumns, tableData, seriesList] = useMemo(() => {
        const data: TableSeries[] = []
        const seriesList = []
        let exist = false
        tdata.forEach(s => {
            if (s.name == series) {
                exist = true
            }
            seriesList.push(s.name)
            data.push(s)
        })


        for (var i = 0; i < data.length; i++) {
            const s = data[i]

            if (!exist || s.name == series) {
                if (!exist) {
                    setSeries(s.name)
                }
                return [s.columns, s.rows, seriesList]
            }
        }

        return [[], [], seriesList]
    }, [series, tdata, props.panel.overrides, panel.enableTransform])

    return (
        <>
            {isEmpty(tableData)
                ?
                <Center height="100%">No data</Center>
                :
                <Flex h="100%" justify="space-between" direction="column">
                    <Box maxH={series && seriesList.length > 1  ? "calc(100% - 32px)" : "100%"} overflowY="scroll" sx={cssStyles(colorMode, props.panel.plugins.table.column.colorTitle)}>
                        <ComplexTable panel={props.panel} dashboardId={props.dashboardId} columns={tableColumns} data={tableData} />
                    </Box>
                    {series && seriesList.length > 1 && <Select value={series} mt="1" size="sm" onChange={e => setSeries(e.currentTarget.value)}>
                        {seriesList.map(series => {
                            return <option key={series} value={series}>{series}</option>
                        })}
                    </Select>}
                </Flex>}
        </>


    )
}

export default TablePanel


const cssStyles = (colorMode: "light" | "dark", colorTitle) =>{
    return {
    '.ant-table-wrapper': {
        maxWidth: 'calc(100% - 1px) !important',
    },
    '.ant-table': {
        background: 'transparent !important'
    },
    'td.ant-table-cell': {
        padding: '0 0 !important'
    },
    'th.ant-table-cell': {
        background: "inherit !important",
        color:colorTitle ? `${colorMode == "light" ? customColors.primaryColor.light : customColors.primaryColor.dark} !important` : 'inherit !important'
    },
    '.ant-table-cell.ant-table-column-sort': {
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
    },
    'th.ant-table-cell:before': {
        width: '0 !important'
    }
}}


export const seriesDataToTableData = (rawData: SeriesData[][]) => {
    const data: TableSeries[] = []
    const columns = []
    if (rawData.length == 0 || rawData[0].length == 0) {
        return data
    }

    for (const f of rawData[0][0].fields) {
        columns.push({
            title: f.name,
            dataIndex: f.name,
            key: f.name
        })
    }

    if (columns.length == 0) {
        return data
    }

    for (const d of rawData) {
        for (const s of d) {
            const rows = []

            for (let i = 0; i < s.fields[0].values.length; i++) {
                const row = {}
                for (const f of s.fields) {
                    row[f.name] = f.values[i]
                }
                rows.push(row)
            }

            const series: TableSeries = {
                columns: columns,
                name: s.name,
                rawName: s.name,
                rows: rows
            }

            data.push(series)
        }
    }

    return data
}
