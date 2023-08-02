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

import { Box, Input } from "@chakra-ui/react";
import CodeEditor, { LogqlLang } from "components/CodeEditor/CodeEditor";
import { Form } from "components/form/Form";
import FormItem from "components/form/Item";
import { cloneDeep } from "lodash";
import React, { useRef, useState } from "react"
import { PanelQuery } from "types/dashboard";
import { DatasourceEditorProps } from "types/datasource";

const LokiQueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <Form spacing={1}>
            <FormItem  size="sm"  title="Query">
                <Box width="100%"  ref={containerRef}>
                <CodeEditor 
                    language={LogqlLang} 
                    value={tempQuery.metrics}   
                    onChange={(v) => {
                        setTempQuery({ ...tempQuery, metrics:  v})
                    }} 
                    isSingleLine
                    />
                {/* <Input
                    value={tempQuery.metrics}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, metrics: e.currentTarget.value })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    width="100%"
                    placeholder={`Enter a loki query, e.g: sum(rate({job="varlogs"}[10m])) by (level)`}
                    size="sm"
                /> */}
                </Box>
            </FormItem>
            <FormItem labelWidth="150px"  size="sm"  title="Legend">
                <Input
                    value={tempQuery.legend}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, legend: e.currentTarget.value })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    width="150px"
                    placeholder="{{label}}"
                    size="sm"
                />
            </FormItem>
        </Form>
    )
}

export default LokiQueryEditor