import { HStack, Select, Text } from "@chakra-ui/react"
import { variables } from "components/dashboard/Dashboard"
import { VariableChangedEvent } from "src/data/bus-events"
import { Variable } from "types/variable"
import { dispatch } from "use-bus"
import storage from "utils/localStorage"

interface Props {
    id: number
    variables: Variable[]
}

const vkey = "apm-variables"
const SelectVariables = ({id, variables}: Props) => {
    return (<HStack>
        {variables.map(v => {
            return <HStack>
                <Text fontSize="sm" minWidth="fit-content">{v.name}</Text>
                <Select value={v.selected} size="sm" onChange={e => setVariableValue(v, e.currentTarget.value)}>
                    {
                        v.values.map(v => <option value={v}>{v}</option>)
                    }
                </Select>
            </HStack>
        })}
    </HStack>)
}

export default SelectVariables

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
    for (let i = 0;i<variables.length;i++) {
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