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
import { Box, HStack, Input, VStack, useMediaQuery} from "@chakra-ui/react"
import { cloneDeep } from "lodash"
import {  useState } from "react"
import { PanelQuery } from "types/dashboard"
import React from "react";
import { DatasourceEditorProps } from "types/datasource"
import FormItem from "src/components/form/Item"
import { Form } from "src/components/form/Form"
import { prometheusDsMsg } from "src/i18n/locales/en";
import { useStore } from "@nanostores/react";
import CodeEditor, { LogqlLang } from "src/components/CodeEditor/CodeEditor";
import { IsSmallScreen } from "src/data/constants";
import { $datasources } from "src/views/datasource/store";



const QueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const t1 = useStore(prometheusDsMsg)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const [isSmallScreen] = useMediaQuery(IsSmallScreen)
    const isLargeScreen = !isSmallScreen
    const Stack = isLargeScreen ? HStack : VStack



    const ds = $datasources.get().find(d => d.id == datasource.id)

    return (
        <Form spacing={1}>
            <FormItem size="sm" title="query">
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
        </Form>
    )
}

export default QueryEditor

