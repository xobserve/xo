import { HStack, Select, Text } from "@chakra-ui/react"
import {  variables } from "src/views/dashboard/Dashboard"
import { VariableChangedEvent } from "src/data/bus-events"
import { Variable, VariableQueryType } from "types/variable"
import { dispatch } from "use-bus"
import storage from "utils/localStorage"
import { useEffect, useState } from "react"
import { DatasourceType } from "types/dashboard"
import { isEmpty, set } from "lodash"
import { queryPromethuesVariableValues } from "../dashboard/plugins/datasource/prometheus/query_runner"
import { queryHttpVariableValues } from "../dashboard/plugins/datasource/http/query_runner"
import { datasources } from "src/views/App"

interface Props {
    id: number
    variables: Variable[]
}

const vkey = "apm-variables"
const SelectVariables = ({ id, variables }: Props) => {
    return (<HStack>
        {variables.map(v => {
            return <SelectVariable v={v} />
        })}
    </HStack>)
}

export default SelectVariables

const SelectVariable = ({ v }: { v: Variable }) => {
    const [values, setValues] = useState<string[]>([])

    useEffect(() => {
        console.log( console.log("333333load variable values", v))
        loadValues()
    }, [])

    const loadValues = async () => {
        const result = await queryVariableValues(v)
        setValues(result)
        v.values = result
       
    }

    return <HStack key={v.id}>
        <Text fontSize="sm" minWidth="fit-content" mt="1px">{v.name}</Text>
        {!isEmpty(values) &&<Select value={v.selected} size="sm" variant="unstyled" onChange={e => setVariableValue(v, e.currentTarget.value)}>
            {
                values.map(v => <option key={v} value={v}>{v}</option>)
            }
        </Select>}
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
    let exist = false;
    for (var i = 0; i < variable.values.length; i++) {
        if (variable.values[i] == value) {
            exist = true
            break
        }
    }

    if (!exist) {
        return `value ${value} not exist in variable ${variable.name}`
    }

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

    dispatch(VariableChangedEvent)
}

export const setVariable = (name, value, toast?) => {
    let v;
    for (var i = 0; i < variables.length; i++) {
        if (variables[i].name == name) {
            v = variables[i]
            break
        }
    }

    const err = setVariableValue(v, value)
    if (err && toast) {
        toast({
            title: "On row click error",
            description: err,
            status: "warning",
            duration: 9000,
            isClosable: true,
        })
    }
}

export const queryVariableValues = async (v:Variable) => {
    let result = []
    if (v.type == VariableQueryType.Custom) {
        result = v.value.split(",")
    } else {
        const ds = datasources.find(d => d.id == v.datasource)
        switch (ds?.type) {
            case DatasourceType.Prometheus:
                result = await queryPromethuesVariableValues(v)
                break;
            case DatasourceType.ExternalHttp:
                result = await queryHttpVariableValues(v)
                break;
            default:
                break;
        }
    }

    if (!isEmpty(v.regex)) {
        const regex = new RegExp(v.regex)
        result = result?.filter(v => regex.test(v))
    }
   
    return result??[]
}