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
import {  isFunction, round } from "lodash"
import _ from 'lodash'
import { getNewestTimeRange } from "components/DatePicker/TimePicker"
import { isJSON } from "utils/is"
import { replaceWithVariables } from "utils/variable"
import { requestApi } from "utils/axios/request"
import { isEmpty } from "utils/validate"
import { roundDsTime } from "utils/datasource"

export const run_http_query = async (panel: Panel, q: PanelQuery, range: TimeRange, ds: Datasource) => {
    if (isEmpty(q.metrics.trim())) {
        return {
            error: null,
            data: []
        }
    }
    //@todo: 
    // 1. rather than query directyly to prometheus, we should query to our own backend servie
    // 2. using `axios` instead of `fetch`
    const start = roundDsTime(range.start.getTime() / 1000)
    const end = roundDsTime(range.end.getTime() / 1000)
    let url = q.metrics
    const headers = {}
    if (!isEmpty(q.data.transformRequest)) {
        const transformRequest = genDynamicFunction(replaceWithVariables(q.data.transformRequest));
        if (isFunction(transformRequest)) {
            url = transformRequest(url, headers, start, end, panel)
        } else {
            return {
                error: 'transformRequest is not a valid function',
                data: []
            }
        }
    }



    const res: any = await requestApi.get(`/proxy?proxy_url=${encodeURIComponent(url)}`)
    let result
    if (!isEmpty(q.data.transformResult)) {
        const transformResult = genDynamicFunction(q.data.transformResult);
        if (isFunction(transformResult)) {
            // return {error: string, data: any} format
            return transformResult(res, q, start, end)        
        } else {
            return {
                error: 'transformResult is not a valid function',
                data: []
            }
        }
    } else {
        // default return format:
        // {
        //     "status": "success",
        //     "error": "error message",
        //     "errorType": "error type",
        //     "data": []
        // }
        if (res.status !== "success") {
            console.log("Failed to fetch data from prometheus", res)
            return {
                error: `${res.errorType}: ${res.error}`,
                data: []
            }
        }
        result = res.data
    }

    return {
        error: null,
        data: result
    }
}

export const checkAndTestHttp = async (ds: Datasource) => {
    // check datasource setting is valid
    const res = isHttpDatasourceValid(ds)
    if (res != null) {
        return res
    }

    return true
}


export const queryHttpVariableValues = async (variable: Variable, useCurrentTimerange = true) => {
    let result = {
        error: null,
        data: null
    }
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
    if (!data || isEmpty(data.url)) {
        return result
    }
    const timeRange = getNewestTimeRange()
    const start = roundDsTime(timeRange.start.getTime() / 1000)
    const end = roundDsTime(timeRange.end.getTime() / 1000)


    const headers = {}
    let url
    if (!isEmpty(data.transformRequest)) {
        const transformRequest = genDynamicFunction(replaceWithVariables(data.transformRequest));
        if (isFunction(transformRequest)) {
            url = transformRequest(replaceWithVariables(data.url), headers, start, end)
        } else {
            return []
        }
    }

    try {
        const res = await requestApi.get(`/proxy?proxy_url=${encodeURIComponent(url)}`)
        result.data = res

        if (!isEmpty(data.transformResult)) {
            const transformResult = genDynamicFunction(data.transformResult);
            if (isFunction(transformResult)) {
                result = transformResult(res)
            } else {
                result.data = []
            }
        }
    } catch (error) {
        console.error("variable http request error:",error)
    }


    return result
}


export const replaceHttpQueryWithVariables = (query: PanelQuery, interval: string) => {

}
