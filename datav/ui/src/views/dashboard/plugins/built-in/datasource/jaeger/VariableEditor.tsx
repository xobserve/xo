// Copyright 2023 observex.io Team
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
import { Box, Select, Switch } from "@chakra-ui/react"
import { useEffect } from "react"
import { Variable } from "types/variable"
import { isJSON } from "utils/is"
import { EditorInputItem } from "src/components/editor/EditorItem"
import { DatasourceVariableEditorProps } from "types/datasource"
import FormItem from "src/components/form/Item"
import { queryJaegerVariableValues } from "./query_runner"
import ChakraSelect from "src/components/select/ChakraSelect"
import React from "react";
import { useStore } from "@nanostores/react"
import { jaegerDsMsg } from "src/i18n/locales/en"


export enum JaegerDsQueryTypes {
    Services = "Services",
    Operations = "Operations",
}

const JaegerVariableEditor = ({ variable, onChange, onQueryResult }: DatasourceVariableEditorProps) => {
    const t1 = useStore(jaegerDsMsg)
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : {}

    if (data.useCurrentTime == undefined) {
        data.useCurrentTime = true
    }

    useEffect(() => {
        loadVariables(variable)
    }, [variable])

    const loadVariables = async (v: Variable) => {
        const result = await queryJaegerVariableValues(v)
        onQueryResult(result)
    }

    return (<>
        <FormItem title={t1.queryType}>
            <Box width="200px">
                <ChakraSelect variant="outline" size="md" placeholder="select type.." value={{ label: data.type, value: data.type }} onChange={v => {
                    data.type = v
                    onChange(variable => {
                        variable.value = JSON.stringify(data)
                    })
                }} options={
                    Object.values(JaegerDsQueryTypes).map(v => ({ label: v, value: v }))
                } />
            </Box>
        </FormItem>
        {data.type == JaegerDsQueryTypes.Operations && <FormItem title="Service">
            <EditorInputItem value={data.service} onChange={v => {
                data.service = v
                onChange(variable => {
                    variable.value = JSON.stringify(data)
                })
            }}  placeholder={t1.serviceTips}/>
        </FormItem>}

    </>)
}

export default JaegerVariableEditor

