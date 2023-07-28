import { Variable, VariableQueryType, VariableRefresh } from "types/variable";

export const initVariable:Variable = {
    name: '',
    type: VariableQueryType.Custom,
    value: "",
    regex: "",
    refresh: VariableRefresh.OnDashboardLoad,
    enableMulti: false,
    enableAll: false
}

export const VariableSplitChar = '+'
export const VarialbeAllOption = '__all__'

export const VariableCurrentValue = '__current__'
