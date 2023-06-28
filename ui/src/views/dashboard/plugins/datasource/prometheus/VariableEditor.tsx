import { Input, InputGroup, InputLeftAddon, Select, Text } from "@chakra-ui/react"
import { FormItem } from "components/form/Form"
import { useEffect, useState } from "react"
import { Variable } from "types/variable"
import { useImmer } from "use-immer"
import { isJSON } from "utils/is"
import { PromLabelSelect, PromMetricSelect } from "./Editor"
import { getInitTimeRange } from "components/TimePicker"
import { datasources } from "src/views/dashboard/Dashboard"

interface Props {
    variable: Variable
    onChange: any
    onValuesChange: any
}

enum PromDsQueryTypes {
    LabelValues = "Label values",
    LabelNames = "Label names",
    Metrics = "Metrics"
}

const PrometheusVariableEditor = ({ variable, onChange,onValuesChange }: Props) => {
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : {
        type: PromDsQueryTypes.LabelValues
    }

    useEffect(() => {
        loadVariables(data)
    }, [variable])
    
    const loadVariables = async (data) => {
        const result = await queryPromethuesVariables(data, variable.datasource )
        // onValuesChange(result)
    }

    return (<>
        <FormItem title="query">
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
        </FormItem>
    </>)
}

export default PrometheusVariableEditor

const queryPromethuesVariables = async (data, dsId, useCurrentTimerange = true) => {
    const timeRange = getInitTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000

    const datasource = datasources.find(ds => ds.id == dsId)


    let result;
    if (data.type == PromDsQueryTypes.LabelValues) {
        if (data.metrics && data.label) {
            // query label values : https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
            const url = `${datasource.url}/api/v1/label/${data.label}/values?${useCurrentTimerange ? `&start=${start}&end=${end}` : ""}&match[]=${data.metrics}`
            const res0 = await fetch(url)
            const res = await res0.json()
            if (res.status == "success") {
                result = res.data
            }
        }
    }

    return result
}