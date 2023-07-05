// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { TimeRange } from "types/time"
import { isJaegerDatasourceValid } from "./DatasourceEditor"
import { requestApi } from "utils/axios/request"
import { jaegerToPanels } from "./transformData"
import { isJSON } from "utils/is"
import { Variable } from "types/variable"
import { JaegerDsQueryTypes } from "./VariableEditor"
import { replaceWithVariablesHasMultiValues } from "utils/variable"
import { cloneDeep } from "lodash"

export const run_jaeger_query = async (panel: Panel, q: PanelQuery,range: TimeRange,ds: Datasource) => {
    let res = []
    switch (panel.type) {
        case PanelType.NodeGraph:
            res = await queryDependencies(ds.id, range)
            break
    
        default:
            break;
    }
    
    const data =  jaegerToPanels(res, panel,q, range)
    return {
        error: null,
        data: data
    }
}

export const queryDependencies = async (dsId, range: TimeRange) => {
    const start= range.start.getTime()
    const end = range.end.getTime()

    const res = await requestApi.get(`/proxy/${dsId}/api/dependencies?endTs=${end}&lookback=${end-start}`)
    return res.data
}

export const checkAndTestJaeger = async (ds:Datasource) => {
    // check datasource setting is valid
    const res = isJaegerDatasourceValid(ds)
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


export const replaceJaegerQueryWithVariables = (query: PanelQuery) => {
    const showServices0 = query.data?.showServices ? query.data?.showServices?.split(",") : []
 
    const ss = []
    showServices0.forEach((item, i) => {
        ss.push(...replaceWithVariablesHasMultiValues(item))
    })
    query.data.showServices = ss
}

export const queryServices = async (dsId) => {
    const res = await requestApi.get(`/proxy/${dsId}/api/services`)
    return res.data
}

export const queryOperations = async (dsId, service) => {
    const res = await requestApi.get(`/proxy/${dsId}/api/services/${service}/operations`)
    return res.data
}

export const queryJaegerVariableValues = async (variable: Variable) => {
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
    if (!data) {
        return
    }

    let result = [];
    if (data.type == JaegerDsQueryTypes.Services) {
            const res = await queryServices(variable.datasource)
            result = res
    } else if (data.type == JaegerDsQueryTypes.Operations) {
        if (data.service) {
            const services  = replaceWithVariablesHasMultiValues(data.service)
            for (let i = 0; i < services.length; i++) {
                const res = await queryOperations(variable.datasource, services[i])
                result = result.concat(res)
            }
        }
    } 

    return result
}

