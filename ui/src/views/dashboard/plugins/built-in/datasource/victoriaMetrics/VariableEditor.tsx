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
import { Button, Select, Switch, Text } from "@chakra-ui/react"
import { useEffect } from "react"
import { Variable } from "types/variable"
import { isJSON } from "utils/is"
import { PromLabelSelect, PromMetricSelect } from "./QueryEditor"
import { queryVariableValues } from "./query_runner"
import { EditorInputItem } from "src/components/editor/EditorItem"
import { DatasourceVariableEditorProps } from "types/datasource"
import FormItem from "src/components/form/Item"
import React from "react";
import { useStore } from "@nanostores/react"
import { cfgVariablemsg } from "src/i18n/locales/en"
import { getCurrentTimeRange } from "components/DatePicker/TimePicker"
import { dateTimeFormat } from "utils/datetime/formatter"


export enum PromDsQueryTypes {
    LabelValues = "Label values",
    LabelNames = "Label names",
    Metrics = "Metrics"
}

const VariableEditor = ({ variable, onChange,onQueryResult }: DatasourceVariableEditorProps) => {
    const t1 = useStore(cfgVariablemsg)
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
        const result = await queryVariableValues(v)
        onQueryResult(result)
    }

    const timeRange = getCurrentTimeRange()
    return (<>
            <FormItem title={t1.useCurrentTime} alignItems="center">
                <Switch size="md" defaultChecked={data.useCurrentTime} onChange={e => {
                    data.useCurrentTime = e.target.checked
                    onChange(variable => {
                        variable.value = JSON.stringify(data)
                    })
                }}/>
                {data.useCurrentTime && <Text textStyle="annotation">{dateTimeFormat(timeRange.start)} - {dateTimeFormat(timeRange.end)}</Text>}
            </FormItem>
            <FormItem title={t1.queryType}>
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
                    <FormItem title="Metric" desc={t1.metricTips}>
                        <PromMetricSelect width="100%" dsId={variable.datasource} variant="outline" value={data.metrics} onChange={m => {
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

export default VariableEditor

