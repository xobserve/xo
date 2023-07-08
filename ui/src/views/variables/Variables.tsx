import { HStack, Text, useToast } from "@chakra-ui/react"
import {  variables } from "src/views/dashboard/Dashboard"
import { TimeChangedEvent, VariableChangedEvent, VariableForceReload } from "src/data/bus-events"
import { Variable, VariableQueryType, VariableRefresh } from "types/variable"
import useBus, { dispatch } from "use-bus"
import storage from "utils/localStorage"
import { useEffect, useState } from "react"
import { DatasourceType } from "types/dashboard"
import { isEmpty, isEqual } from "lodash"
import { queryPromethuesVariableValues } from "../dashboard/plugins/datasource/prometheus/query_runner"
import { queryHttpVariableValues } from "../dashboard/plugins/datasource/http/query_runner"
import { datasources } from "src/views/App"
import PopoverSelect from "components/select/PopoverSelect"
import { VarialbeAllOption, VariableSplitChar } from "src/data/variable"
import { VariableManuallyChangedKey } from "src/data/storage-keys"
import { queryJaegerVariableValues } from "../dashboard/plugins/datasource/jaeger/query_runner"


interface Props {
    id: number
    variables: Variable[]
}

const vkey = "apm-variables"
const SelectVariables = ({ variables }: Props) => {
    return (<HStack spacing={2}>
        {variables.map(v => {
            return <SelectVariable key={v.id} v={v} />
        })}
    </HStack>)
}

export default SelectVariables

const SelectVariable = ({ v }: { v: Variable }) => {
    const toast = useToast()
    const [values, setValues] = useState<string[]>([])

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
        VariableForceReload+v.id,
        () => {
            console.log("force variable to reload values", v.name);
            loadValues()
        },
        []
    )

    useEffect(() => {
        // console.log("load variable values( useEffect )", v.name)
        loadValues()
        
    }, [v.value])
    
    const loadValues = async () => {
        let result =[]
        // if (v.enableAll) {
        //     result.push(VarialbeAllOption)
        // }

        let needQuery = true
        if (v.refresh == VariableRefresh.Manually) {
            // load from storage first
            let vs = storage.get(VariableManuallyChangedKey+v.id)
            if (vs) {
                result = [...result, ...vs]
                needQuery = false
            } 
        } 
        
        if (needQuery) {
            console.log("load variable values( query )", v.name)
            const res = await queryVariableValues(v)
            if (res.error) {
                setValues([])
                v.values = []
                return 
            }
            result = [...result, ...res.data??[]]
            if (v.refresh == VariableRefresh.Manually) {
                storage.set(VariableManuallyChangedKey+v.id, res)
            }
        }
        
        if (!isEqual(result, v.values)) {
            if (v.selected != VarialbeAllOption) {
                if (v.selected) {
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
            dispatch(VariableChangedEvent)   
        }

       
        setValues(result)
        v.values = result

        
        

    }
    

    const value = isEmpty(v.selected) ? [] : v.selected.split(VariableSplitChar)
    
    return <HStack key={v.id} spacing={2}>
        <Text fontSize="sm" minWidth="fit-content">{v.name}</Text>
        {!isEmpty(values) &&
        <PopoverSelect 
            value={value} 
            size="sm" 
            variant="unstyled" 
            onChange={value => {
                const vs = value.filter(v1 => values.includes(v1))
                setVariableValue(v, vs.length == 0 ? "" : vs.join(VariableSplitChar))
            }}
            options={ values.map(v => ({value:v, label:v == VarialbeAllOption ? "ALL" : v}))}
            exclusive={VarialbeAllOption}
            isMulti={v.enableMulti}
            showArrow={false}
            matchWidth={v.id.toString().startsWith('d-')}
        />}
    </HStack>
}
export const setVariableSelected = (variables: Variable[]) => {
    let sv = storage.get(vkey)
    if (!sv) {
        sv = {}
    }

    for (const v of variables) {
        const selected = sv[v.id]
        if (!selected) {
            v.selected = v.values[0]
        } else {
            v.selected = selected
        }
    }
}


export const setVariableValue = (variable: Variable, value) => {    
    variable.selected = value
    for (let i = 0; i < variables.length; i++) {
        if (variables[i].id == variable.id) {
            variables[i] = variable
        }
    }

    const sv = storage.get(vkey)
    if (!sv) {
        storage.set(vkey, {
            [variable.id]: value
        })
    } else {
        sv[variable.id] = value
        storage.set(vkey, sv)
    }

    

    let needReload = true
    for (const v of variables) {
        if (v.id != variable.id &&  v.value.indexOf('${' + variable.name + '}') >= 0) {
            dispatch(VariableForceReload+v.id)
            needReload = false
        }
    }

    // dispatch variable changed event until relational variables are reloaded
    if (needReload) dispatch(VariableChangedEvent)
}

export const setVariable = (name, value, toast?) => {
    let v;
    for (var i = 0; i < variables.length; i++) {
        if (variables[i].name == name) {
            v = variables[i]
            break
        }
    }

    setVariableValue(v, value)
}

export const queryVariableValues = async (v:Variable) => {
    let result = {
        error: null,
        data: null
    }
    if (v.type == VariableQueryType.Custom) {
        if (v.value.trim() != "") {
            result.data = v.value.split(",")
        }
    } else {
        const ds = datasources.find(d => d.id == v.datasource)
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
            default:
                break;
        }
    }

    if (!result.error) {
        return result
    }

    if (!isEmpty(v.regex)) {
        const regex = new RegExp(v.regex)
        result.data = result?.data?.filter(v => regex.test(v))
    }
   
    return result
}