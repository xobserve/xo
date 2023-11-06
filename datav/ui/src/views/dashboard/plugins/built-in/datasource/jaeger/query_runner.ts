// Copyright 2023 xObserve.io Team
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

// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery } from "types/dashboard"
import { Datasource } from "types/datasource"
import { TimeRange } from "types/time"
import { isJaegerDatasourceValid } from "./DatasourceEditor"
import { requestApi } from "utils/axios/request"
import { jaegerToPanels } from "./transformData"
import { isJSON } from "utils/is"
import { Variable } from "types/variable"
import { JaegerDsQueryTypes } from "./VariableEditor"
import { replaceWithVariablesHasMultiValues } from "utils/variable"
import { getDatasource } from "utils/datasource"
import { isEmpty } from "utils/validate"
import { PanelTypeNodeGraph } from "../../panel/nodeGraph/types"
import { PanelTypeTable } from "../../panel/table/types"

export const run_jaeger_query = async (panel: Panel, q: PanelQuery, range: TimeRange, ds: Datasource) => {
    let res = []
    switch (panel.type) {
        case PanelTypeNodeGraph:
        case PanelTypeTable:
            res = await queryDependencies(ds.id, range)
            break
        default:
            break;
    }

    const data = jaegerToPanels(res, panel, q, range)
    return {
        error: null,
        data: data
    }
}

export const queryDependencies = async (dsId, range: TimeRange) => {
    const start = range.start.getTime()
    const end = range.end.getTime()

    const ds = getDatasource(dsId)
    const res = await requestApi.get(`/proxy/${ds.id}/api/dependencies?endTs=${end}&lookback=${end - start}`)
    return res.data
}

export const checkAndTestJaeger = async (ds: Datasource) => {
    // check datasource setting is valid
    const res = isJaegerDatasourceValid(ds)
    if (res != null) {
        return res
    }

    // test connection status
    try {
        await requestApi.get(`/common/proxy/${ds.id}?proxy_url=${ds.url}/api/services`)
        return true
    } catch (error) {
        return error.message
    }
}


export const replaceJaegerQueryWithVariables = (query: PanelQuery) => {
    const showServices0 = query.metrics ? query.metrics.split(",") : []

    const ss = []
    showServices0.forEach((item, i) => {
        ss.push(...replaceWithVariablesHasMultiValues(item))
    })
    query.data.showServices = ss

}

export const queryJaegerServices = async (dsId) => {
    const ds = getDatasource(dsId)
    const res = await requestApi.get(`/proxy/${ds.id}/api/services`)
    return res.data
}

export const queryJaegerOperations = async (dsId, service) => {
    const ds = getDatasource(dsId)
    const res = await requestApi.get(`/proxy/${ds.id}/api/services/${service}/operations`)
    return res.data
}

export const queryJaegerVariableValues = async (variable: Variable) => {
    const result = {
        error: null,
        data: []
    }
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
    if (!data) {
        return result
    }

    if (data.type == JaegerDsQueryTypes.Services) {
        const res = await queryJaegerServices(variable.datasource)
        result.data = res
    } else if (data.type == JaegerDsQueryTypes.Operations) {
        if (data.service) {
            const services = replaceWithVariablesHasMultiValues(data.service)
            for (let i = 0; i < services.length; i++) {
                const res = await queryJaegerOperations(variable.datasource, services[i])
                result.data = result.data.concat(res)
            }
        }
    }

    return result
}


export const queryJaegerTraces = async (dsId, timeRange: TimeRange, service, operation, tags, min, max, limit) => {
    const ds = getDatasource(dsId)

    const start = timeRange.start.getTime() * 1000
    const end = timeRange.end.getTime() * 1000

    let url = `/proxy/${ds.id}/api/traces?limit=${limit}&start=${start}&end=${end}&service=${service}`
    if (operation != "all" && !isEmpty(operation)) {
        url += `&operation=${operation}`
    }

    if (max == '') {
        url += `&maxDuration`
    } else {
        url += `&maxDuration=${max}`
    }

    if (min == '') {
        url += `&minDuration`
    } else {
        url += `&minDuration=${min}`
    }

    if (tags != '') {
        url += `&tags=${tags}`
    }

    const res = await requestApi.get(url)
    return res.data
}

export const queryJaegerTrace = async (dsId, traceId) => {
    const ds = getDatasource(dsId)
    const res = await requestApi.get(`/proxy/${ds.id}/api/traces/${traceId}`)
    return res.data
}