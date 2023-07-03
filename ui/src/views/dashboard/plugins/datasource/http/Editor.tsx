import { HStack, Input, VStack } from "@chakra-ui/react"
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal"
import Label from "components/form/Item"
import { cloneDeep, isEmpty, set } from "lodash"
import { useEffect, useState } from "react"
import { PanelQuery } from "types/dashboard"
import { Datasource, DatasourceEditorProps } from "types/datasource"


const HttpQueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
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
        <VStack alignItems="left" spacing="1">
            <HStack>
                <Label width="200px">URL</Label>
                <Input
                    value={tempQuery.metrics}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, metrics: e.currentTarget.value })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    placeholder="Remote http address"
                    size="sm"
                />
            </HStack>
            <HStack>
                <Label width="200px" desc="If you want insert some imformation before request is sent to remote, e.g current time, just edit this function">Request transform</Label>
                <CodeEditorModal value={tempQuery.data.transformRequest} onChange={v => {
                    tempQuery.data.transformRequest = v
                    onChange(tempQuery)
                }} />
            </HStack>
            <HStack>
                <Label width="200px" desc="The http request result is probably not compatible with your visualization panels, here you can define a function to transform the result">Result transform</Label>
                <CodeEditorModal value={tempQuery.data.transformResult} onChange={v => {
                    tempQuery.data.transformResult = v
                    onChange(tempQuery)
                }} />
            </HStack>
        </VStack>
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

