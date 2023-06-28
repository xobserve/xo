import { Datasource } from "types/datasource"
import { isHttpDatasourceValid } from "./DatasourceEditor"
import { Variable } from "types/variable"

export const checkAndTestHttp = async (ds:Datasource) => {
    // check datasource setting is valid
    const res = isHttpDatasourceValid(ds)
    if (res != null) {
        return res
    }

    return true
}


export const queryHttpVariableValues = async (variable:Variable, useCurrentTimerange = true) => {
    // const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
    // if (!data) {
    //     return 
    // }
    
    // const timeRange = getInitTimeRange()
    // const start = timeRange.start.getTime() / 1000
    // const end = timeRange.end.getTime() / 1000

    // const datasource = datasources.find(ds => ds.id == variable.datasource)


    let result;
    // if (data.type == PromDsQueryTypes.LabelValues) {
    //     if (data.metrics && data.label) {
    //         // query label values : https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
    //         const url = `${datasource.url}/api/v1/label/${data.label}/values?${useCurrentTimerange ? `&start=${start}&end=${end}` : ""}&match[]=${data.metrics}`
    //         const res0 = await fetch(url)
    //         const res = await res0.json()
    //         if (res.status == "success") {
    //             result = res.data
    //         }
    //     }
    // }

    return result
}