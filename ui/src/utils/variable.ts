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
import { replacePrometheusQueryWithVariables } from "src/views/dashboard/plugins/datasource/prometheus/query_runner";
import { replaceJaegerQueryWithVariables } from "src/views/dashboard/plugins/datasource/jaeger/query_runner";
import { replaceHttpQueryWithVariables } from "src/views/dashboard/plugins/datasource/http/query_runner";
import { VariableSplitChar, VarialbeAllOption } from "src/data/variable";
import { gvariables } from "src/App";
import { cloneDeep, isEmpty } from "lodash";
import { replaceLokiQueryWithVariables } from "src/views/dashboard/plugins/datasource/loki/query_runner";
import { $variables } from "src/views/variables/store";

export const hasVariableFormat = (s: string) => {
    return parseVariableFormat(s).length > 0
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
            s = s.replace(`\${${f}}`, extrav.toString());
        } else {
            const v = vars.find(v => v.name ==f)
            if (v) {
                s = s.replace(`\${${f}}`, v.selected);
            }
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
        case DatasourceType.Loki:
            replaceLokiQueryWithVariables(q)
        default:
            break;
    } 
}

// replace ${xxx} format in s with every possible value of the variable
// if s doesn't contain any variable, return [s]
export const  replaceWithVariablesHasMultiValues =  (s: string, replaceAllWith?): string[] => {
    const vars = $variables.get()
    let res = []
    console.log("here333 load var", cloneDeep(vars), s)
    const formats = parseVariableFormat(s);
    for (const f of formats) {
        const v = (vars.length > 0 ? vars : gvariables).find(v => v.name ==f)
        if (v) {
          
            let selected = []
            if (v.selected == VarialbeAllOption) {
                if (replaceAllWith) {
                    selected.push(replaceAllWith)
                } else {
                    selected = v.values
                } 
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