import { Variable } from "types/variable";
import { parseVariableFormat } from "./format";
import { DatasourceType, PanelQuery } from "types/dashboard";
import { replacePrometheusQueryWithVariables } from "src/views/dashboard/plugins/datasource/prometheus/query_runner";
import { replaceJaegerQueryWithVariables } from "src/views/dashboard/plugins/datasource/jaeger/query_runner";
import { variables } from "src/views/dashboard/Dashboard";
import { replaceHttpQueryWithVariables } from "src/views/dashboard/plugins/datasource/http/query_runner";
import { VariableSplitChar, VarialbeAllOption } from "src/data/variable";
import { gvariables } from "src/views/App";
import { isEmpty } from "lodash";

// replace ${xxx} format with corresponding variable
export const replaceWithVariables = (s: string) => {
    const formats = parseVariableFormat(s);
    for (const f of formats) {
        const v = variables.find(v => v.name ==f)
        if (v) {
            s = s.replace(`\${${f}}`, v.selected);
        }
    }

    return s
}


export const replaceQueryWithVariables = (q: PanelQuery, datasource: DatasourceType) => {
    //@needs-update-when-add-new-datasource
    switch (datasource) {
        case DatasourceType.Prometheus:
            replacePrometheusQueryWithVariables(q)
            break;
        case DatasourceType.Jaeger:
            replaceJaegerQueryWithVariables(q)
            break
        case DatasourceType.ExternalHttp:
            replaceHttpQueryWithVariables(q)
            break
        default:
            break;
    } 
}

// replace ${xxx} format in s with every possible value of the variable
// if s doesn't contain any variable, return [s]
export const  replaceWithVariablesHasMultiValues =  (s: string): string[] => {
    let res = []
    const formats = parseVariableFormat(s);
    for (const f of formats) {
        const v = (variables.length > 0 ? variables : gvariables).find(v => v.name ==f)
        if (v) {
          
            let selected = []
            if (v.selected == VarialbeAllOption) {
                selected = v.values
            } else {
                selected = isEmpty(v.selected) ? [] : v.selected.split(VariableSplitChar)
            }
            res = selected.map(v => s.replace(`\${${f}}`, v))
        }
    }

    if (res.length == 0) {
        res.push(s)
    }

    return res
}