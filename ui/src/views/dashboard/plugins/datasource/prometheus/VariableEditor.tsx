import { Input, InputGroup, InputLeftAddon, Select } from "@chakra-ui/react"
import { FormItem } from "components/form/Form"
import { useEffect } from "react"
import { Variable } from "types/variable"
import { isJSON } from "utils/is"
import { PromLabelSelect, PromMetricSelect } from "./Editor"
import { queryPromethuesVariableValues } from "./query_runner"
import { EditorInputItem } from "components/editor/EditorItem"

interface Props {
    variable: Variable
    onChange: any
    onQueryResult: any
}

export enum PromDsQueryTypes {
    LabelValues = "Label values",
    LabelNames = "Label names",
    Metrics = "Metrics"
}

const PrometheusVariableEditor = ({ variable, onChange,onQueryResult }: Props) => {
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : {
        type: PromDsQueryTypes.LabelValues
    }

    useEffect(() => {
        loadVariables(variable)
    }, [variable])
    
    const loadVariables = async (v) => {
        const result = await queryPromethuesVariableValues(v )
        onQueryResult(result)
    }

    return (<>
            <InputGroup size="sm" mt="2">
                <InputLeftAddon children='Query type' />
                <Select value={data.type} onChange={e => {
                    const v = e.currentTarget.value
                    data.type = v
                    onChange(variable => {
                        variable.value = JSON.stringify(data)
                    })
                }}>
                    {Object.keys(PromDsQueryTypes).map(k => <option value={PromDsQueryTypes[k]}>{PromDsQueryTypes[k]}</option>)}
                </Select>
            </InputGroup>
            {
                data.type == PromDsQueryTypes.LabelValues && <>
                    <InputGroup size="sm" mt="2">
                        <InputLeftAddon children='Metric' />
                        <PromMetricSelect dsId={variable.datasource} variant="outline" value={data.metrics} onChange={m => {
                            data.metrics = m
                            onChange(variable => {
                                variable.value = JSON.stringify(data)
                            })
                        }} />
                    </InputGroup>
                    <InputGroup size="sm" mt="2">
                        <InputLeftAddon children='Label' />
                        <PromLabelSelect metric={data.metrics} dsId={variable.datasource} variant="outline" value={data.label} onChange={m => {
                            data.label = m
                            onChange(variable => {
                                variable.value = JSON.stringify(data)
                            })
                        }} />
                    </InputGroup>
                </>
            }

            {
                data.type == PromDsQueryTypes.Metrics && <>
                    <InputGroup size="sm" mt="2">
                        <InputLeftAddon children='Metric regex' />
                        <EditorInputItem placeholder="e.g go_*" value={data.regex} onChange={m => {
                            data.regex = m
                            onChange(variable => {
                                variable.value = JSON.stringify(data)
                            })
                        }}/>
                    </InputGroup>
                </>
            }
    </>)
}

export default PrometheusVariableEditor

