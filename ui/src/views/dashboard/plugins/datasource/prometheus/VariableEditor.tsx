import { Button, Select, Switch } from "@chakra-ui/react"
import { useEffect } from "react"
import { Variable } from "types/variable"
import { isJSON } from "utils/is"
import { PromLabelSelect, PromMetricSelect } from "./Editor"
import { queryPromethuesVariableValues } from "./query_runner"
import { EditorInputItem } from "components/editor/EditorItem"
import { DatasourceVariableEditorProps } from "types/datasource"
import FormItem from "components/form/Item"



export enum PromDsQueryTypes {
    LabelValues = "Label values",
    LabelNames = "Label names",
    Metrics = "Metrics"
}

const PrometheusVariableEditor = ({ variable, onChange,onQueryResult }: DatasourceVariableEditorProps) => {
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : {
        type: PromDsQueryTypes.LabelValues
    }

    if (data.useCurrentTime == undefined) {
        data.useCurrentTime = true
    }
     
    useEffect(() => {
        loadVariables(variable)
    }, [variable])
    
    const loadVariables = async (v:Variable) => {
        const result = await queryPromethuesVariableValues(v)
        onQueryResult(result)
    }

    return (<>
            <FormItem title="Use current time" alignItems="center">
                <Switch size="md" defaultChecked={data.useCurrentTime} onChange={e => {
                    data.useCurrentTime = e.target.checked
                    onChange(variable => {
                        variable.value = JSON.stringify(data)
                    })
                }}/>
            </FormItem>
            <FormItem title="Query type">
                <Select value={data.type} onChange={e => {
                    const v = e.currentTarget.value
                    data.type = v
                    onChange(variable => {
                        variable.value = JSON.stringify(data)
                    })
                }}>
                    {Object.keys(PromDsQueryTypes).map(k => <option value={PromDsQueryTypes[k]}>{PromDsQueryTypes[k]}</option>)}
                </Select>
            </FormItem>
            {
                data.type == PromDsQueryTypes.LabelValues && <>
                    <FormItem title="Metric" desc="support using variables">
                        <PromMetricSelect width="400px" dsId={variable.datasource} variant="outline" value={data.metrics} onChange={m => {
                            data.metrics = m
                            onChange(variable => {
                                variable.value = JSON.stringify(data)
                            })
                        }} />
                    </FormItem>
                    <FormItem title="Label">
                        <PromLabelSelect metric={data.metrics} dsId={variable.datasource} variant="outline" value={data.label} onChange={m => {
                            data.label = m
                            onChange(variable => {
                                variable.value = JSON.stringify(data)
                            })
                        }} />
                    </FormItem>
                </>
            }

            {
                data.type == PromDsQueryTypes.Metrics && <>
                    <FormItem title="Metric regex">
                        <EditorInputItem placeholder="e.g go_*" value={data.regex} onChange={m => {
                            data.regex = m
                            onChange(variable => {
                                variable.value = JSON.stringify(data)
                            })
                        }}/>
                    </FormItem>
                </>
            }
    </>)
}

export default PrometheusVariableEditor

