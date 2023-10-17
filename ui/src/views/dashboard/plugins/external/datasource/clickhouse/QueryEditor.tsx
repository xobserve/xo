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
import { Box, HStack, Input, VStack, useMediaQuery, Select } from "@chakra-ui/react"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { PanelQuery } from "types/dashboard"
import React from "react";
import { DatasourceEditorProps } from "types/datasource"
import FormItem from "src/components/form/Item"
import { Form } from "src/components/form/Form"
import { commonMsg, prometheusDsMsg } from "src/i18n/locales/en";
import { useStore } from "@nanostores/react";
import CodeEditor, { LogqlLang } from "src/components/CodeEditor/CodeEditor";
import { IsSmallScreen } from "src/data/constants";
import { $datasources } from "src/views/datasource/store";
import { DataFormat } from "types/format";
import { locale } from "src/i18n/i18n";
import ExpandTimeline from "../../../components/query-edtitor/ExpandTimeline";




const QueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const t1 = useStore(prometheusDsMsg)
    const t = useStore(commonMsg)
    let lang = useStore(locale)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const [isSmallScreen] = useMediaQuery(IsSmallScreen)
    const isLargeScreen = !isSmallScreen
    const Stack = isLargeScreen ? HStack : VStack
    if (tempQuery.data['expandTimeline'] == undefined) {
        tempQuery.data['expandTimeline'] = 'auto'
    }

    const ds = $datasources.get().find(d => d.id == datasource.id)

    return (
        <Form spacing={1}>
            <FormItem size="sm" title={t.query}>
                <Stack width="100%" alignItems={isLargeScreen ? "center" : "end"}>
                    <Box width={isLargeScreen ? "calc(100% - 100px)" : "calc(100% - 5px)"}>
                        <CodeEditor
                            language="sql"
                            value={tempQuery.metrics}
                            onChange={(v) => {
                                setTempQuery({ ...tempQuery, metrics: v })
                            }}
                            onBlur={() => {
                                onChange(tempQuery)
                            }}
                            isSingleLine
                            placeholder="enter clickhouse query"
                        />
                    </Box>
                </Stack>
            </FormItem>
            <Stack alignItems={isLargeScreen ? "center" : "start"} spacing={isLargeScreen ? 4 : 1}>
                <FormItem labelWidth={"100px"} size="sm" title="Legend">
                    <Input
                        value={tempQuery.legend}
                        onChange={(e) => {
                            setTempQuery({ ...tempQuery, legend: e.currentTarget.value })
                        }}
                        onBlur={() => onChange(tempQuery)}
                        width="100px"
                        placeholder={t1.legendFormat}
                        size="sm"
                    />
                </FormItem>
                <FormItem labelWidth={"150px"} size="sm" title={lang == "en" ? "Format as" : "数据格式"} desc={lang == "en" ? "Timeseries format will aggregate fields that are neither of time nor number type into series label and name, Table format will keep all the fields from the query response, making it very suitable for Table panel." : "Timeseries 格式会将既不是时间也不是数值的字段聚合成 Series 名称和标签，而 Table 格式会保留所有字段，因此它特别适用于 Table 图表。"}>
                    <Select size="sm" value={tempQuery.data['format']} onChange={(e) => {
                        tempQuery.data['format'] = e.currentTarget.value
                        const q = { ...tempQuery, data: cloneDeep(tempQuery.data) }
                        setTempQuery(q)
                        onChange(q)
                    }} >
                        <option value={DataFormat.TimeSeries}>Time series</option>
                        <option value={DataFormat.Table}>Table</option>
                    </Select>
                </FormItem> 
            </Stack>
            {/* <ExpandTimeline t1={t1} tempQuery={tempQuery} setTempQuery={setTempQuery} onChange={onChange}/> */}

        </Form>
    )
}

export default QueryEditor



