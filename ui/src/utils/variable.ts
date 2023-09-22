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

import { parseVariableFormat } from "./format";
import { DatasourceType, PanelQuery } from "types/dashboard";
import { replacePrometheusQueryWithVariables } from "src/views/dashboard/plugins/built-in/datasource/prometheus/query_runner";
import { replaceJaegerQueryWithVariables } from "src/views/dashboard/plugins/built-in/datasource/jaeger/query_runner";
import { VariableSplitChar, VarialbeAllOption } from "src/data/variable";
import { $variables } from "src/views/variables/store";
import { isEmpty } from "./validate";
import { externalDatasourcePlugins } from "src/views/dashboard/plugins/external/plugins";

export const hasVariableFormat = (s: string) => {
    return isEmpty(s) ? false : s.includes("${")
}

// replace ${xxx} format with corresponding variable
// extraVars: datav preserved variables, such as __curentValue__
export const replaceWithVariables = (s: string, extraVars?: {
    [varName:string]: string | number, 
}) => {
    const vars = $variables.get()
    const formats = parseVariableFormat(s);
    for (const f of formats) {
        const extrav = extraVars && extraVars[f]
        if (extrav) {
            s = s.replaceAll(`\${${f}}`, extrav.toString());
        } else {
            const v = vars.find(v => v.name ==f)
            if (v) {
                s = s.replaceAll(`\${${f}}`, v.selected);
            }
        }
       
    }

    return s
}


export const replaceQueryWithVariables = (q: PanelQuery, datasource: DatasourceType,interval: string) => {
    //@needs-update-when-add-new-datasource
    switch (datasource) {
        case DatasourceType.Prometheus:
            replacePrometheusQueryWithVariables(q,interval)
            break;
        case DatasourceType.Jaeger:
            replaceJaegerQueryWithVariables(q)
            break
        case DatasourceType.ExternalHttp:
            replacePrometheusQueryWithVariables(q,interval)
            break
        case DatasourceType.Loki:
            replacePrometheusQueryWithVariables(q, interval)
            break
        default:
            const p = externalDatasourcePlugins[datasource]
            if (p && p.replaceQueryWithVariables) {
                p.replaceQueryWithVariables(q, interval)
            }
            break;
    } 
}

// replace ${xxx} format in s with every possible value of the variable
// if s doesn't contain any variable, return [s]
export const  replaceWithVariablesHasMultiValues =  (s: string, replaceAllWith?): string[] => {
    const vars = $variables.get()
    let res = []
    const formats = parseVariableFormat(s);
    for (const f of formats) {
        // const v = (vars.length > 0 ? vars : gvariables).find(v => v.name ==f)
         const v = vars.find(v => v.name ==f)
        if (v) {
          
            let selected = []
            if (v.selected == VarialbeAllOption) {
                if (replaceAllWith) {
                    selected.push(replaceAllWith)
                } else {
                    selected = v.values?.filter(v1 => v1 != VarialbeAllOption )??[]
                } 
            } else {
                selected = isEmpty(v.selected) ? [] : v.selected.split(VariableSplitChar)
            }

       
            res = selected.map(v => s.replaceAll(`\${${f}}`, v))
        }
    }

    if (res.length == 0) {
        res.push(s)
    }

    // console.log("here333333:",s, res)

    return res
}


