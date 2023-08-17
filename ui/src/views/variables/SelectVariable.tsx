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
import { HStack, Text, Tooltip, useToast } from "@chakra-ui/react"
import { TimeChangedEvent, VariableForceReload } from "src/data/bus-events"
import { Variable, VariableQueryType, VariableRefresh } from "types/variable"
import useBus, { dispatch } from "use-bus"
import storage from "utils/localStorage"
import { memo, useEffect, useState } from "react"
import { DatasourceType } from "types/dashboard"
import { cloneDeep, isEqual } from "lodash"
import { queryPromethuesVariableValues } from "../dashboard/plugins/datasource/prometheus/query_runner"
import { queryHttpVariableValues } from "../dashboard/plugins/datasource/http/query_runner"
import { datasources } from "src/App"
import PopoverSelect from "components/select/PopoverSelect"
import { VarialbeAllOption, VariableSplitChar } from "src/data/variable"
import { VariableManuallyChangedKey } from "src/data/storage-keys"
import { queryJaegerVariableValues } from "../dashboard/plugins/datasource/jaeger/query_runner"
import React from "react";
import { useStore } from "@nanostores/react"
import { variableMsg } from "src/i18n/locales/en"
import { addParamToUrl, getUrlParams } from "utils/url"
import { queryLokiVariableValues } from "../dashboard/plugins/datasource/loki/query_runner"
import { $variables } from "./store"
import { parseVariableFormat } from "utils/format"
import { getDatasource } from "utils/datasource"
import { isEmpty } from "utils/validate"
import { useLocation } from "react-router-dom"
import { usePrevious, useSearchParam } from "react-use"

interface Props {
    variables: Variable[]
}

const vkey = "variables"
const SelectVariables = ({ variables }: Props) => {
    return (<HStack spacing={2}>
        {variables.map(v => {
            return <SelectVariable key={v.id} v={v} />
        })}
    </HStack>)
}

export default SelectVariables

const SelectVariable = memo(({ v }: { v: Variable }) => {
    const t1 = useStore(variableMsg)
    const [values, setValues] = useState<string[]>(null)
    const urlKey = 'var-' + v.name
    const varInUrl = useSearchParam(urlKey)
    const prevVarInUrl = usePrevious(varInUrl)
    
    useBus(
        (e) => { return e.type == TimeChangedEvent },
        (e) => {
            if (v.refresh == VariableRefresh.OnTimeRangeChange) {
                console.log("load variable values( on time change )", v.name)
                loadValues()
            }
        },
        [v]
    )

    useBus(
        VariableForceReload + v.id,
        () => {
            console.log("force variable to reload values", v.name);
            forceReload()
        },
        []
    )

    useEffect(() => {
        if (values === null) {
            return 
        }
        if ( !isEmpty(varInUrl) && varInUrl !== prevVarInUrl) {
            setValue(v, varInUrl)
        }
    },[varInUrl, prevVarInUrl])

    useEffect(() => {
        loadValues(false)
    }, [v.value])

    const forceReload = async () => {
        await loadValues(true)
        const vars = $variables.get()
        const newVars = []
        for (const v1 of vars) {
            if (v1.id == v.id) {
                newVars.push(cloneDeep(v))
            } else {
                newVars.push(v1)
            }
        }
        $variables.set(newVars)
    }

    const loadValues = async (forceLoad = false) => {
        let result = []
        if (v.enableAll) {
            result.push(VarialbeAllOption)
        }

        let needQuery = true
        if (!forceLoad && v.refresh == VariableRefresh.Manually) {
            // load from storage first
            let vs = storage.get(VariableManuallyChangedKey + v.id)
            if (vs) {
                result = [...result, ...vs]
                needQuery = false
            }

        }
        if (needQuery) {
            const res = await queryVariableValues(v)
            console.log("load variable values( query )", v.name, res)
            if (res.error) {
                result = []
            } else {
                res.data?.sort()
                result = [...result, ...res.data ?? []]
                if (v.refresh == VariableRefresh.Manually) {
                    storage.set(VariableManuallyChangedKey + v.id, res.data)
                }
            }
        }

        const oldSelected = v.selected
        if (!isEqual(result, v.values)) {
            if (v.selected != VarialbeAllOption) {
                if (!isEmpty(v.selected)) {
                    const selected = v.selected.split(VariableSplitChar)?.filter(s => result.includes(s))
                    if (selected.length == 0) {
                        v.selected = result[0]
                    } else {
                        v.selected = selected.join(VariableSplitChar)
                    }
                } else {
                    v.selected = result[0]
                }
            }
        }

        const vars = $variables.get()
        if (v.selected != oldSelected || v.selected == VarialbeAllOption) {
            const referVars = parseVariableFormat(v.value)
            for (const variable of vars) {
                // console.log("here33333:",v.name, variable)
                // to avoid circle refer evets: 
                // A refer B : A send event to B, then B refer to A, B send event to A
                if (v.id == variable.id || referVars.includes(variable.name)) {
                    continue
                }

                if ((variable.datasource?.toString())?.indexOf('${' + v.name + '}') >= 0 || variable.value?.indexOf('${' + v.name + '}') >= 0) {
                    // to avoid cache missing ,add a interval here
                    // Two consecutive requests will miss the cache, because the result of first request has not been save to cache, but the second request has arrived
                    setTimeout(() => {
                        dispatch(VariableForceReload + variable.id)
                    }, 100)
                }

                // if ((variable.datasource.toString()).indexOf('${' + v.name + '}') >= 0 || (variable.value).indexOf('${' + v.name + '}') >= 0) {
                //     // to avoid cache missing ,add a interval here
                //     // Two consecutive requests will miss the cache, because the result of first request has not been save to cache, but the second request has arrived
                //     setTimeout(() => {
                //         dispatch(VariableForceReload + variable.id)
                //     }, 100)
                // }
            }

        }
        setValues(result??[])
        v.values = result
        if (needQuery) {
          $variables.set([...vars])
        }
    }



    const value = isEmpty(v.selected) ? [] : v.selected.split(VariableSplitChar)

    return <HStack key={v.id} spacing={2}>
        <Tooltip openDelay={300} label={(v.id.toString().startsWith("d-") ? t1.dashScoped : t1.globalScoped)}><Text fontSize="sm" minWidth="fit-content">{v.name}</Text></Tooltip>
        {!isEmpty(values) &&
            <PopoverSelect
                value={value}
                size="sm"
                variant="unstyled"
                onChange={value => {
                    const vs = value.filter(v1 => values.includes(v1))
                    setVariableValue(v, vs.length == 0 ? "" : vs.join(VariableSplitChar))
                }}
                options={values.map(v => ({ value: v, label: v }))}
                exclusive={VarialbeAllOption}
                isMulti={v.enableMulti}
                showArrow={false}
                matchWidth={v.id.toString().startsWith('d-')}
            />}
    </HStack>
})
export const setVariableSelected = (variables: Variable[]) => {
    const params = getUrlParams()
    const selectedInUrl = {}
    for (const k of Object.keys(params)) {
        if (k.startsWith('var-')) {
            const r = k.slice(4)
            selectedInUrl[r] = params[k]
        }
    }

    let sv = storage.get(vkey)
    if (!sv) {
        sv = {}
    }


    for (const v of variables) {
        const selected = selectedInUrl[v.name] ?? sv[v.id]
        if (!selected) {
            v.selected = v.values && v.values[0]
        } else {
            v.selected = selected
        }
    }


}


export const setVariableValue = (variable: Variable, value) => {
    const k = 'var-' + variable.name
    const params = getUrlParams()
    if (!params[k]) {
        addParamToUrl({
            [k]: variable.selected
        })
    }
    // sync to url
    addParamToUrl({
        [k]: value
    })
}

const setValue = (variable: Variable, value) => {
    const vars = $variables.get()
    variable.selected = value
    const newVars = []
    for (let i = 0; i < vars.length; i++) {
        if (vars[i].id == variable.id) {
            newVars.push(cloneDeep(variable))
        } else {
            newVars.push(vars[i])
        }
    }
    $variables.set(newVars)

    const sv = storage.get(vkey)
    if (!sv) {
        storage.set(vkey, {
            [variable.id]: value
        })
    } else {
        sv[variable.id] = value
        storage.set(vkey, sv)
    }

    const referVars = parseVariableFormat(variable.value)
    for (const v of vars) {
        // to avoid circle refer evets: 
        // A refer B : A send event to B, then B refer to A, B send event to A
        if (v.id == variable.id || referVars.includes(v.name)) {
            continue
        }
        if ((v.datasource?.toString())?.indexOf('${' + variable.name + '}') >= 0 || v.value?.indexOf('${' + variable.name + '}') >= 0) {
            dispatch(VariableForceReload + v.id)
        }
    }
}
export const setVariable = (name, value) => {
    const vars = $variables.get()
    let v;
    for (var i = 0; i < vars.length; i++) {
        if (vars[i].name == name) {
            v = vars[i]
            break
        }
    }

    
    v && setVariableValue(v, value)
}

export const queryVariableValues = async (v: Variable) => {
    let result = {
        error: null,
        data: null
    }

    if (v.type == VariableQueryType.Custom) {
        if (v.value.trim() != "") {
            result.data = v.value.split(",")
        }
    } else if (v.type == VariableQueryType.Datasource) {
        result.data =datasources.map(ds => ds.name)
    } else {
        const ds = getDatasource(v.datasource)
        //@needs-update-when-add-new-variable-datasource
        switch (ds?.type) {
            case DatasourceType.Prometheus:
                result = await queryPromethuesVariableValues(v)
                break;
            case DatasourceType.ExternalHttp:
                result = await queryHttpVariableValues(v) as any
                break;
            case DatasourceType.Jaeger:
                result = await queryJaegerVariableValues(v)
                break
            case DatasourceType.Loki:
                result = await queryLokiVariableValues(v)
                break
            default:
                break;
        }
    }

    if (result.error) {
        return result
    }


    if (!isEmpty(v.regex)) {
        const regex = v.regex.toLowerCase()
        result.data = result?.data?.filter((r:string) => r.toLowerCase().match(regex))
    }

    return result
}