import { Input, useToast } from "@chakra-ui/react"
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal"
import Label from "components/form/Item"
import { isEmpty } from "lodash"
import { DatasourceVariableEditorProps } from "types/datasource"
import { isJSON } from "utils/is"
import { useEffect } from "react"
import { queryHttpVariableValues } from "./query_runner"
import FormItem from "components/form/Item"
import { EditorInputItem } from "components/editor/EditorItem"
import React from "react";

const HttpVariableEditor = ({ variable, onChange, onQueryResult }: DatasourceVariableEditorProps) => {
    const toast = useToast()
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
            />
        </FormItem>
        <FormItem title='Request transform'>
            {/* <Label width="200px" desc="If you want insert some imformation before request is sent to remote, e.g current time, just edit this function">Request transform</Label> */}
            <CodeEditorModal value={data.transformRequest} onChange={v => {
                data.transformRequest = v
                onChange(variable => {
                    variable.value = JSON.stringify(data)
                })
            }} />
        </FormItem>


        <FormItem title="Result transform">
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
`function transformRequest(url,headers,startTime, endTime,replaceWithVariables) {
    let newUrl = url + \`&start=$\{startTime}&end=$\{endTime}\`
    console.log("here333 transform request :", url, newUrl, headers, startTime, endTime)
    return newUrl
}`

const initTransformResult =
`function transformResult(httpResult) {
    console.log("here333 transformResult:", httpResult)
    returen httpResult.data    
}`
