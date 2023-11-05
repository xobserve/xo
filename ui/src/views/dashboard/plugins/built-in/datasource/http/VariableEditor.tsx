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
import { CodeEditorModal } from "src/components/CodeEditor/CodeEditorModal"
import Label from "src/components/form/Item"
import { isEmpty } from "lodash"
import { DatasourceVariableEditorProps } from "types/datasource"
import { isJSON } from "utils/is"
import { useEffect } from "react"
import { queryHttpVariableValues } from "./query_runner"
import FormItem from "src/components/form/Item"
import { EditorInputItem } from "src/components/editor/EditorItem"
import React from "react";
import { useStore } from "@nanostores/react"
import { httpDsMsg } from "src/i18n/locales/en"

const HttpVariableEditor = ({ variable, onChange, onQueryResult }: DatasourceVariableEditorProps) => {
    const t1 = useStore(httpDsMsg)
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : {}

    let update;
    if (isEmpty(data.transformResult)) {
        data.transformResult =  initTransformResult
        update = true
    }
    if (isEmpty(data.transformRequest)) {
        data.transformRequest =  initTransformRequest
        update = true
    }
    if (update)  onChange(variable => {
        variable.value = JSON.stringify(data)
    })

    useEffect(() => {
        loadVariables(variable)
    }, [variable])
    
    const loadVariables = async (v) => {
        const result = await queryHttpVariableValues(variable)
        onQueryResult(result)
    }

    return (<>
        <FormItem title="URL">
            <EditorInputItem
                value={data.url}
                onChange={(v) => {
                    data.url = v
                    onChange(variable => {
                        variable.value = JSON.stringify(data)
                    })
                }}
                placeholder="support variable"
            />
        </FormItem>
        <FormItem title={t1.reqTransform}>
            {/* <Label width="200px" desc="If you want insert some imformation before request is sent to remote, e.g current time, just edit this function">Request transform</Label> */}
            <CodeEditorModal value={data.transformRequest} onChange={v => {
                data.transformRequest = v
                onChange(variable => {
                    variable.value = JSON.stringify(data)
                })
            }} />
        </FormItem>


        <FormItem title={t1.respTransform}>
            {/* <Label width="200px" desc="The http request result is probably not compatible with your visualization panels, here you can define a function to transform the result">Result transform</Label> */}
            <CodeEditorModal value={data.transformResult} onChange={v => {
                data.transformResult = v
                onChange(variable => {
                    variable.value = JSON.stringify(data)
                })
            }} />
        </FormItem>
    </>)
}

export default HttpVariableEditor



const initTransformRequest =
`
// support variables
function transformRequest(url,headers,startTime, endTime, variables) {
    let newUrl = url + \`?&start=$\{startTime}&end=$\{endTime}\`
    return newUrl
}`

const initTransformResult =
`function transformResult(httpResult) {
    console.log("here333 transformResult:", httpResult)
    return httpResult    
}`
