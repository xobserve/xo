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
import { Button, Select, Switch } from "@chakra-ui/react"
import { useEffect } from "react"
import { Variable } from "types/variable"
import { isJSON } from "utils/is"
import { EditorInputItem } from "components/editor/EditorItem"
import { DatasourceVariableEditorProps } from "types/datasource"
import FormItem from "components/form/Item"
import React from "react";
import { useStore } from "@nanostores/react"
import { cfgVariablemsg } from "src/i18n/locales/en"
import { queryLokiVariableValues } from "./query_runner"


export enum LokiDsQueryTypes {
    LabelValues = "Label values",
    LabelNames = "Label names",
    Series = "Series"
}

const LokiVariableEditor = ({ variable, onChange, onQueryResult }: DatasourceVariableEditorProps) => {
    const t1 = useStore(cfgVariablemsg)
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : {
        type: LokiDsQueryTypes.Series,
    }

    if (data.useCurrentTime == undefined) {
        data.useCurrentTime = true
    }

    useEffect(() => {
        loadVariables(variable)
    }, [variable])

    const loadVariables = async (v: Variable) => {
        const result = await queryLokiVariableValues(v)
        console.log("here3333333:",result)
        onQueryResult(result)
    }

    return (<>
        <FormItem title={t1.useCurrentTime} alignItems="center">
            <Switch size="md" defaultChecked={data.useCurrentTime} onChange={e => {
                data.useCurrentTime = e.target.checked
                onChange(variable => {
                    variable.value = JSON.stringify(data)
                })
            }} />
        </FormItem>
        <FormItem title={t1.queryType}>
            <Select value={data.type} onChange={e => {
                const v = e.currentTarget.value
                data.type = v
                onChange(variable => {
                    variable.value = JSON.stringify(data)
                })
            }}>
                {Object.keys(LokiDsQueryTypes).map(k => <option value={LokiDsQueryTypes[k]}>{LokiDsQueryTypes[k]}</option>)}
            </Select>
        </FormItem>
        <FormItem title="Series selector" desc={` 'Optional. If defined, a list of values for the specified log series selector is returned. For example: {label="value"}, you can also select multi series, split with space: {label="value1"} {label="value2"}'`}>
            <EditorInputItem value={data.seriesSelector} onChange={v => {
                data.seriesSelector = v
                onChange(variable => {
                    variable.value = JSON.stringify(data)
                })
            }} placeholder="optional series selector" />
        </FormItem>
        {/* {
                data.type == PromDsQueryTypes.LabelValues && <>
                    <FormItem title="Metric" desc={t1.metricTips}>
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
            } */}

        {/* {
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
            } */}
    </>)
}

export default LokiVariableEditor

