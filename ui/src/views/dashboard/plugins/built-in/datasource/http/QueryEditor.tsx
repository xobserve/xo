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
import { HStack, Input, VStack } from "@chakra-ui/react"
import { CodeEditorModal } from "src/components/CodeEditor/CodeEditorModal"
import { Form } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { cloneDeep, isEmpty, set } from "lodash"
import { useEffect, useState } from "react"
import { PanelQuery } from "types/dashboard"
import { DatasourceEditorProps } from "types/datasource"
import React from "react";
import { useStore } from "@nanostores/react"
import { httpDsMsg } from "src/i18n/locales/en"
import { PanelTypeAlert } from "../../panel/alert/types"

const HttpQueryEditor = ({panel, datasource, query, onChange }: DatasourceEditorProps) => {
    const t1 = useStore(httpDsMsg)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    useEffect(() => {
        if (isEmpty(tempQuery.data.transformResult)) {
            setTempQuery({
                ...tempQuery, data: {
                    ...tempQuery.data, transformResult: initTransformResult 
                }
            })
            onChange(cloneDeep(tempQuery))
        }

        if (isEmpty(tempQuery.data.transformRequest)) {
            setTempQuery({
                ...tempQuery, data: {
                    ...tempQuery.data, transformRequest: initTransformRequest
                }
            })
            onChange(cloneDeep(tempQuery))
        }
    }, [])
    const size = panel?.type == PanelTypeAlert ? "sm" : "md"
    return (<>
        <Form spacing={1}>
            <FormItem title="URL" labelWidth={size == "md" ? "200px" : "60px"} size={size}>
                <Input
                    value={tempQuery.metrics}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, metrics: e.currentTarget.value.trim() })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    placeholder={t1.remoteHttp}
                    size={size}
                />
            </FormItem>

            <FormItem title={t1.reqTransform} size={size} labelWidth={size == "md" ? "200px" : "150px"} desc={t1.reqTransformTips} alignItems="center">
                <CodeEditorModal value={tempQuery.data.transformRequest} onChange={v => {
                    tempQuery.data.transformRequest = v
                    onChange(tempQuery)
                }} />
            </FormItem>

            <FormItem title={t1.respTransform} size={size} labelWidth={size == "md" ? "200px" : "150px"} desc={t1.respTransformTips} alignItems="center">
                <CodeEditorModal value={tempQuery.data.transformResult} onChange={v => {
                    tempQuery.data.transformResult = v
                    onChange(tempQuery)
                }} />
            </FormItem>

        </Form>
    </>)
}

export default HttpQueryEditor




const initTransformRequest =
`function transformRequest(url,headers,startTime, endTime, panel, variables) {
    let newUrl = url + \`?&start=$\{startTime}&end=$\{endTime}\`
    return newUrl
}`



const initTransformResult =
`function transformResult(httpResult, query, startTime, endTime) {

    // Please resutrn {error: string | null, data: any} format
    // When using http datasource, it's your responsibility to make the panel you are using work!
    // so you need to know which data format the panel is using, and return data in that format.
    // You can find panel data format in Panel Debug.
    // Find more info in https://datav.io/docs or play the online demo https://play.datav.io
    return {
        error: null, 
        data: httpResult
    }
}`