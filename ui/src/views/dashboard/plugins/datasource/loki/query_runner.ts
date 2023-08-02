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

import { Panel, PanelQuery } from "types/dashboard";
import { Datasource } from "types/datasource";
import { TimeRange } from "types/time";
import { replaceWithVariablesHasMultiValues } from "utils/variable";
import { isLokiDatasourceValid } from "./DatasourceEditor";
import { requestApi } from "utils/axios/request";
import { Variable } from "types/variable";
import { isEmpty } from "utils/validate";

export const run_loki_query = async (panel: Panel, q: PanelQuery, range: TimeRange, ds: Datasource) => {
    if (isEmpty(q.metrics)) {
        return {
            error: null,
            data: []
        }
    }

}

export const replaceLokiQueryWithVariables = (query: PanelQuery) => {
    const showServices0 = query.data?.showServices ? query.data?.showServices?.split(",") : []
    
    const ss = []
    showServices0.forEach((item, i) => {
        ss.push(...replaceWithVariablesHasMultiValues(item))
    })
    query.data.showServices = ss

}

export const queryLokiVariableValues = async (variable: Variable) => {
    const result = {
        error:null,
        data:[]
    }


    return result
}

export const checkAndTestLoki = async (ds:Datasource) => {
    // check datasource setting is valid
    const res = isLokiDatasourceValid(ds)
    if (res != null) {
        return res
    }

    // test connection status
    try {
        await  requestApi.get(`/proxy?proxy_url=${ds.url}/api/services`)
        return true
    } catch (error) {
        return error.message
    }
}