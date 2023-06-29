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