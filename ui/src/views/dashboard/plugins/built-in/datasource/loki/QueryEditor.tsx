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

import { Box, HStack, Input } from "@chakra-ui/react";
import { InputNumber } from "antd";
import CodeEditor, { LogqlLang } from "src/components/CodeEditor/CodeEditor";
import { Form } from "src/components/form/Form";
import FormItem from "src/components/form/Item";
import { cloneDeep } from "lodash";
import React, { useEffect, useRef, useState } from "react"
import { PanelQuery } from "types/dashboard";
import { DatasourceEditorProps } from "types/datasource";
import { queryLokiSeries } from "./query_runner";
import { getCurrentTimeRange } from "src/components/DatePicker/TimePicker";

const LokiQueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))

    useEffect(() => {
        queryLokiSeries(datasource.id, [`{filename: "/var/log/a.log"}`, `{job : "varlogs"}`], getCurrentTimeRange())
    },[])

    return (
        <Form spacing={1}>
            <FormItem size="sm" title="Query">
                <Box width="100%">
                    <CodeEditor
                        language={LogqlLang}
                        value={tempQuery.metrics}
                        onChange={(v) => {
                            setTempQuery({ ...tempQuery, metrics: v })
                        }}
                        onBlur={() => {
                            onChange(tempQuery)
                        }}
                        placeholder={`Enter loki query, e.g sum(rate({job="varlogs"}[10m])) by (level)`}
                        height="50px"
                        isSingleLine
                    />
                </Box>
            </FormItem>
            <HStack>
                <FormItem labelWidth={"150px"} size="sm" title="Legend">
                    <Input
                        value={tempQuery.legend}
                        onChange={(e) => {
                            setTempQuery({ ...tempQuery, legend: e.currentTarget.value })
                        }}
                        onBlur={() => onChange(tempQuery)}
                        width="150px"
                        size="sm"
                    />
                </FormItem>
                <FormItem labelWidth="100px" size="sm" title="Limit" desc="Max logs returned by query">
                    <InputNumber
                        value={tempQuery.data.limit}
                        onChange={(v) => {
                            setTempQuery({ ...tempQuery, data: { ...tempQuery.data, limit: v } })
                        }}
                        onBlur={() => onChange(tempQuery)}
                        width="150px"
                        placeholder="1000"
                    />
                </FormItem>
            </HStack>
        </Form>
    )
}

export default LokiQueryEditor