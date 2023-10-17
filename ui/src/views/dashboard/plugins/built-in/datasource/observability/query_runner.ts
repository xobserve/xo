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
import { Variable } from "types/variable"
import { Panel, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"
import { genDynamicFunction } from "utils/dashboard/dynamicCall"
import {  isFunction, round } from "lodash"
import _ from 'lodash'
import { getNewestTimeRange } from "src/components/DatePicker/TimePicker"
import { isJSON } from "utils/is"
import { replaceWithVariables } from "utils/variable"
import { requestApi } from "utils/axios/request"
import { isEmpty } from "utils/validate"
import { roundDsTime } from "utils/datasource"
import { $variables } from "src/views/variables/store"
import { QueryPluginData, QueryPluginResult } from "types/plugin"
import { queryPluginDataToTable, queryPluginDataToTimeSeries } from "utils/plugins"
import { DataFormat } from "types/format"

export const runQuery = async (panel: Panel, q: PanelQuery, range: TimeRange, ds: Datasource) => {
    if (isEmpty(q.metrics)) {
        return {
            error: null,
            data: []
        }
    }

    const start = roundDsTime(range.start.getTime() / 1000)
    const end = roundDsTime(range.end.getTime() / 1000)



    const res: {
        status: string,
        error: string,
        data: QueryPluginResult
    } = await requestApi.get(`/proxy/${ds.id}?query=${replaceWithVariables(q.metrics)}&params=${q.data.params}&start=${start}&end=${end}&step=${q.interval}`)
    
    if (res.status !== "success") {
        console.log("Failed to fetch data from target datasource", res)
        return {
            error: res.error,
            data: []
        }
    }
    let data;
    switch (q.data["format"]) {
        case DataFormat.TimeSeries:
            data = queryPluginDataToTimeSeries(res.data.data, q)
            break
        case DataFormat.Table:
            data =  queryPluginDataToTable(res.data.data, q)
            break
        default:
            data =  queryPluginDataToTable(res.data.data, q)
    }

    return {
        error: null,
        data
    }
}

export const checkAndTestDatasource = async (ds: Datasource) => {
    // check datasource setting is valid
    const res: QueryPluginResult = await requestApi.get(`/proxy/${ds.id}?query=testDatasource&url=${ds.url}&database=${ds.data.database}&username=${ds.data.username}&password=${ds.data.password}`)
    return res.status == "success" ? true : res.error
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
        const transformRequest = genDynamicFunction(data.transformRequest);
        if (isFunction(transformRequest)) {
            url = transformRequest(replaceWithVariables(data.url), headers, start, end, $variables.get())
        } else {
            return []
        }
    }

    try {
        const res = await requestApi.get(`/common/proxy/${variable.id}?proxy_url=${encodeURIComponent(url)}`,{headers})
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


export const query_http_alerts = async (panel:Panel, timeRange: TimeRange, ds:Datasource, query: PanelQuery ) => {
    // const res = await run_http_query(panel, query, timeRange, ds)
    // res.data.fromDs = ds.type
    // return res
    return []
}