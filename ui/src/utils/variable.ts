import { Variable } from "types/variable";
import { parseVariableFormat } from "./format";
import { DatasourceType, PanelQuery } from "types/dashboard";
import { replacePrometheusQueryWithVariables } from "src/views/dashboard/plugins/datasource/prometheus/query_runner";
import { replaceJaegerQueryWithVariables } from "src/views/dashboard/plugins/datasource/jaeger/query_runner";

// replace ${xxx} format with corresponding variable
export const replaceWithVariables = (s: string, vars: Variable[]) => {
    const formats = parseVariableFormat(s);
    for (const f of formats) {
        const v = vars.find(v => v.name ==f)
        if (v) {
            s = s.replace(`\${${f}}`, v.selected);
        }
    }

    return s
}


// replace ${xxx} format with corresponding variable
export const replaceQueryWithVariables = (q: PanelQuery, datasource: DatasourceType) => {
    //@needs-update-when-add-new-datasource
    switch (datasource) {
        case DatasourceType.Prometheus:
            replacePrometheusQueryWithVariables(q)
            break;
        case DatasourceType.Jaeger:
            replaceJaegerQueryWithVariables(q)
            break
        default:
            break;
    }
}