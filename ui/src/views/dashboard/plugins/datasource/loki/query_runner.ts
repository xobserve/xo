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

import { Panel, PanelQuery, PanelType } from "types/dashboard";
import { Datasource } from "types/datasource";
import { TimeRange } from "types/time";
import { replaceWithVariablesHasMultiValues } from "utils/variable";
import { isLokiDatasourceValid } from "./DatasourceEditor";
import { requestApi } from "utils/axios/request";
import { Variable } from "types/variable";
import { isEmpty } from "utils/validate";
import { round } from "lodash";
import { prometheusToPanels } from "../prometheus/transformData";
import { isJSON } from "utils/is";
import { getNewestTimeRange } from "components/DatePicker/TimePicker";
import { LokiDsQueryTypes } from "./VariableEdtiro";
import { is } from "date-fns/locale";

export const run_loki_query = async (panel: Panel, q: PanelQuery, timeRange: TimeRange, ds: Datasource) => {
    if (isEmpty(q.metrics)) {
        return {
            error: null,
            data: []
        }
    }

    const start = round(timeRange.start.getTime() / 1000)
    const end = round(timeRange.end.getTime() / 1000)

    const res: any = await requestApi.get(`/proxy/${ds.id}/loki/api/v1/query_range?query=${q.metrics}&start=${start}&end=${end}&step=${q.interval}&limit=${q.data["limit"] ?? 1000}`)
    if (res.status !== "success") {
        console.log("Failed to fetch data from loki", res.status)
        return {
            error: res.status !== undefined ? `${res.errorType}: ${res.error}` : res,
            data: []
        }
    }


    if (res.data.result.length == 0 || res.data.result[0].values.length == 0) {
        return {
            error: null,
            data: []
        }
    }


    let data = [];
    const resultType = res.data.resultType
    if (resultType === "matrix") {
        data = prometheusToPanels(res.data, panel, q, timeRange);
    } else if (resultType === "streams" && panel.type == PanelType.Log) {
        data = res.data.result
        for (let i = 0; i < data.length; i++) {
            const labels = data[i].stream
            if (labels['__error__']) {
                return {
                    error: `${labels['__error__']}: ${labels['__error_details__']}`,
                    data: []
                }
            }
            const item = {
                labels: data[i].stream,
                values: data[i].values
            }
            data[i] = item
        }
    }
    return {
        error: null,
        data: data,

    }
}

export const queryLokiSeries = async (dsId, match: string[], timeRange: TimeRange) => {
    let url;
    if (timeRange) {
        const start = round(timeRange.start.getTime() / 1000)
        const end = round(timeRange.end.getTime() / 1000)
        url = `/proxy/${dsId}/loki/api/v1/series?start=${start}&end=${end}`
    } else {
        url = `/proxy/${dsId}/loki/api/v1/series?`
    }

    for (const k of match) {
        if (!isEmpty(k)) {
            url += `&match[]=${k}`
        }
    }

    const res: any = await requestApi.get(url)
    if (res.status !== "success") {
        console.log("Failed to fetch data from loki", res.status)
        return {
            error: res.status !== undefined ? `${res.errorType}: ${res.error}` : res,
            data: []
        }
    }


    const result = []
    for (const r of res.data) {
        let newR = "{"
        Object.keys(r).forEach((k, i) => {
            newR += `${k}="${r[k]}"${i == Object.keys(r).length - 1 ? "" : ","}`
        })
        newR += "}"
        result.push(newR)
    }

    return {
        error: null,
        data: result
    }
}

export const queryLokiLabelNames = async (dsId,timeRange: TimeRange) => {
    let url;
    if (timeRange) {
        const start = round(timeRange.start.getTime() / 1000)
        const end = round(timeRange.end.getTime() / 1000)
        url = `/proxy/${dsId}/loki/api/v1/labels?start=${start}&end=${end}`
    } else {
        url = `/proxy/${dsId}/loki/api/v1/labels?`
    }

    const res: any = await requestApi.get(url)
    if (res.status !== "success") {
        console.log("Failed to fetch data from loki", res.status)
        return {
            error: res.status !== undefined ? `${res.errorType}: ${res.error}` : res,
            data: []
        }
    }

    return {
        error: null,
        data: res.data
    }
}

export const queryLokiVariableValues = async (variable: Variable) => {
    let result = {
        error: null,
        data: []
    }


    let data;
    try {
        data = JSON.parse(variable.value)
    } catch (error) {
        return result
    }


    const timeRange = getNewestTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000


    if (data.type == LokiDsQueryTypes.LabelValues) {
        if (data.label) {
            // query label values : https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
            let url = `/proxy/${variable.datasource}/api/v1/label/${data.label}/values?${data.useCurrentTime ? `&start=${start}&end=${end}` : ""}`
            const metrics = replaceWithVariablesHasMultiValues(data.metrics)
            for (const m of metrics) {
                url += `${m ? `&match[]=${m}` : ''}`
            }
            const res: any = await requestApi.get(url)
            if (res.status == "success") {
                result.data = result.data.concat(res.data)
            } else {
                result.error = res.error
            }
        }
    } else if (data.type == LokiDsQueryTypes.Series) {
        const res = await queryLokiSeries(variable.datasource, data.seriesSelector.split(' '), data.useCurrentTime ? timeRange : null)
        if (res.error) {
            result.error = res.error
        } else {
            result.data = res.data
        }
    } else if (data.type == LokiDsQueryTypes.LabelNames) {
        const res = await queryLokiLabelNames(variable.datasource, data.useCurrentTime ? timeRange : null)
        if (res.error) {
            result.error = res.error
        } else {
            result.data = res.data
        }
    }

    return result
}

export const checkAndTestLoki = async (ds: Datasource) => {
    // check datasource setting is valid
    const res = isLokiDatasourceValid(ds)
    if (res != null) {
        return res
    }

    // test connection status
    try {
        await requestApi.get(`/proxy?proxy_url=${ds.url}/api/services`)
        return true
    } catch (error) {
        return error.message
    }
}