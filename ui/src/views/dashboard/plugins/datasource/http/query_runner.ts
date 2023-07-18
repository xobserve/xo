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
import { Datasource } from "types/datasource"
import { isHttpDatasourceValid } from "./DatasourceEditor"
import { Variable } from "types/variable"
import { Panel, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"
import { genDynamicFunction } from "utils/dynamicCode"
import { isEmpty, isFunction, round } from "lodash"
import _ from 'lodash'
import { getInitTimeRange } from "components/DatePicker/TimePicker"
import { isJSON } from "utils/is"
import { replaceWithVariables } from "utils/variable"
import { requestApi } from "utils/axios/request"

export const run_http_query = async (panel: Panel, q: PanelQuery,range: TimeRange,ds: Datasource) => {
    //@todo: 
    // 1. rather than query directyly to prometheus, we should query to our own backend servie
    // 2. using `axios` instead of `fetch`
    const start = round(range.start.getTime() / 1000)
    const end = round(range.end.getTime() / 1000)
    let url = q.metrics
    const headers = {}
    if (!isEmpty(q.data.transformRequest)) {
        const transformRequest = genDynamicFunction(q.data.transformRequest);
        if (isFunction(transformRequest)) {
             url = transformRequest(url, headers,start , end, replaceWithVariables)
        }  else {
            return {
                error: 'transformRequest is not a valid function',
                data: []
            }
        }
    }
    

    const res = await requestApi.get(`/proxy?proxy_url=${url}`)
    let result = res
    if (!isEmpty(q.data.transformResult)) {
        const transformResult = genDynamicFunction(q.data.transformResult);
        if (isFunction(transformResult)) {
             result = transformResult(res, q, start, end)
        }  else {
            return {
                error: 'transformResult is not a valid function',
                data: []
            }
        }
    }

    
    return {
        error: null,
        data: result
    }
}

export const checkAndTestHttp = async (ds:Datasource) => {
    // check datasource setting is valid
    const res = isHttpDatasourceValid(ds)
    if (res != null) {
        return res
    }

    return true
}


export const queryHttpVariableValues = async (variable:Variable, useCurrentTimerange = true) => {
    const result = {
        error: null,
        data: null
    }
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
    if (!data) {
        return result
    }
    const timeRange = getInitTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000


    const headers = {}
    let url
    if (!isEmpty(data.transformRequest)) {
        const transformRequest = genDynamicFunction(data.transformRequest);
        if (isFunction(transformRequest)) {
             url = transformRequest(data.url, headers,start , end, replaceWithVariables)
        }  else {
            return  []
        }
    }
    
    try {
        const res = await requestApi.get(`/proxy?proxy_url=${url}`)
        result.data = res
        
        if (!isEmpty(data.transformResult)) {
            const transformResult = genDynamicFunction(data.transformResult);
            if (isFunction(transformResult)) {
                 result.data = transformResult(res)
            }  else {
                result.data = []
            }
        }
    } catch (error) {
    }

    
    return result
}


export const replaceHttpQueryWithVariables = (query: PanelQuery) => {

}