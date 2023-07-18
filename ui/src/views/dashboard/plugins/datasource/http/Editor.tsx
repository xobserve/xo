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
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal"
import { Form } from "components/form/Form"
import FormItem from "components/form/Item"
import { cloneDeep, isEmpty, set } from "lodash"
import { useEffect, useState } from "react"
import { PanelQuery } from "types/dashboard"
import { Datasource, DatasourceEditorProps } from "types/datasource"
import React from "react";
import { useStore } from "@nanostores/react"
import { httpDsMsg } from "src/i18n/locales/en"

const HttpQueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
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

    return (<>
        <Form spacing={1}>
            <FormItem title="URL" labelWidth="200px">
                <Input
                    value={tempQuery.metrics}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, metrics: e.currentTarget.value })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    placeholder={t1.remoteHttp}
                    size="sm"
                />
            </FormItem>

            <FormItem title={t1.reqTransform} labelWidth="200px" desc={t1.reqTransformTips}>
                <CodeEditorModal value={tempQuery.data.transformRequest} onChange={v => {
                    tempQuery.data.transformRequest = v
                    onChange(tempQuery)
                }} />
            </FormItem>

            <FormItem title={t1.respTransform} labelWidth="200px" desc={t1.respTransformTips}>
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
    `function transformRequest(url,headers,startTime, endTime, replaceWithVariables) {
    console.log("here33333:", url, headers, startTime, endTime)
    let newUrl = url + \`&start=$\{startTime}&end=$\{endTime}\`
    return newUrl
}`

const initTransformResult =
    `function transformResult(httpResult, query, startTime, endTime) {
console.log("here33333 result:", httpResult)
const data = httpResult.data
let res = []
if (data.resultType === "matrix") {
for (const m of data.result) {
const metric = JSON.stringify(m.metric).replace(/:/g, '=')

const timeValues = []
const valueValues = []

if (!_.isEmpty(m.values)) {
let start = startTime
if (m.values[0][0] <= start) {
start = _.round(m.values[0][0])
}

m.values.forEach((v, i) => {
if (i == 0) {
    if (_.round(v[0]) == start) {
        timeValues.push(start)
        valueValues.push(v[1])
    } else if (_.round(v[0]) > start) {
        timeValues.push(start)
        valueValues.push(null)
    }
}


const lastTs = _.last(timeValues)

for (let i = lastTs + query.interval; i <= v[0]; i += query.interval) {
    if (i < v[0]) {
        timeValues.push(i)
        valueValues.push(null)
    } else {
        timeValues.push(v[0])
        valueValues.push(v[1])
    }
}
})
}


const series = {

name: metric,
length: m.values.length,
fields: [
{
    name: "Time",
    type: "time",
    values: timeValues,
},
{
    name: "Value",
    type: "number",
    values: valueValues,
    labels: m.metric
}
],
}


res.push(series)
}
}
return res
}`

