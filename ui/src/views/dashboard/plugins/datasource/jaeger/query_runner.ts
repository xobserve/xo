// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { TimeRange } from "types/time"
import { isJaegerDatasourceValid } from "./DatasourceEditor"
import { requestApi } from "utils/axios/request"

export const run_jaeger_query = async (panel: Panel, q: PanelQuery,range: TimeRange,ds: Datasource) => {
    let res = []
    switch (panel.type) {
        case PanelType.NodeGraph:
            res = await queryDependencies(ds.id, range)
            break
    
        default:
            break;
    }
    
    const data =  res
    return {
        error: null,
        data: data
    }
}

export const queryDependencies = async (dsId, range: TimeRange) => {
    const start= range.start.getTime()
    const end = range.end.getTime()

    const res = await requestApi.get(`/proxy/${dsId}/api/dependencies?endTs=${end}&loopback=${end-start}`)
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

}