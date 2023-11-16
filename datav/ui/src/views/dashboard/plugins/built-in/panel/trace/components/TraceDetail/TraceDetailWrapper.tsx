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

import { useEffect, useState } from "react"
import { Trace } from "src/views/dashboard/plugins/built-in/panel/trace/types/trace"
import { queryJaegerTrace } from "../../../../datasource/jaeger/query_runner"
import TraceDetail from "./TraceDetail"
import transformTraceData from "../../utils/transform-trace-data"
import ScrollManager from "./scroll/scrollManager"
import { scrollBy, scrollTo } from './scroll/scrollPage';
import React from "react";
import { getDatasource } from "utils/datasource"
import { useStore } from "@nanostores/react"
import { $datasources } from "src/views/datasource/store"
import traceData from '../../mocks/traces.json'
import { DatasourceTypeJaeger } from "../../../../datasource/jaeger/types"
import { DatasourceTypeTestData } from "../../../../datasource/testdata/types"
import { builtinDatasourcePlugins } from "../../../../plugins"
import { externalDatasourcePlugins } from "src/views/dashboard/plugins/external/plugins"
import { getCurrentTimeRange } from "components/DatePicker/TimePicker"
import { DataFormat } from "types/format"
import { requestApi } from "utils/axios/request"
import { $config } from "src/data/configs/config"
import { $variables } from "src/views/variables/store"
import { initVariableSelected } from "src/views/variables/SelectVariable"

const TraceDetailWrapper = ({ id, dsId }) => {
    const [trace, setTrace] = useState<Trace>(null)
    const [scrollManager, setScrollManager] = useState(null)

    const datasources = useStore($datasources)
    const datasource = getDatasource(dsId, datasources)
    const config = useStore($config)
    useEffect(() => {
        load()
        let bodyStyle = document.body.style
        setTimeout(() => {
            bodyStyle.fontSize = 16 + "px!important"
        }, 100)
    }, [])

    const load = async () => {
        const r1 = await requestApi.get(`/datasource/byId/${dsId}`)
        const r2 = await requestApi.get(`/variable/team?teamId=${config.currentTeam}`)
        const res = await Promise.all([r1, r2])

        $datasources.set([res[0].data])
        initVariableSelected(res[1].data)
        $variables.set(res[1].data)
        // const r2 = 


    }
    useEffect(() => {
        if (datasource?.type) {
            loadTrace()
        }


        return () => {
            if (scrollManager?.current) {
                scrollManager.current.destroy();
                scrollManager.current = new ScrollManager(undefined, {
                    scrollBy,
                    scrollTo,
                });
            }
        }
    }, [datasource])

    const loadTrace = async () => {
        let data
        switch (datasource?.type) {
            case DatasourceTypeJaeger:
                const res = await queryJaegerTrace(dsId, id)

                if (res.length > 0) {
                    data = transformTraceData(res[0])
                }
                break
            case DatasourceTypeTestData:
                const r = traceData.data.find(trace => trace.traceID == id)
                if (r) {
                    data = transformTraceData(r as any)
                }
                break
            default:
                const dsPlugin = builtinDatasourcePlugins[datasource?.type] ?? externalDatasourcePlugins[datasource?.type]
                if (dsPlugin && dsPlugin.runQuery) {
                    const res = await dsPlugin.runQuery(null, {
                        metrics: "getTrace",
                        data: {
                            format: DataFormat.Trace
                        }
                    }, getCurrentTimeRange(), datasource, { traceId: id })
                    data = res.data
                }
                break;
        }

        setTrace(data)
        const sm = new ScrollManager(data, {
            scrollBy,
            scrollTo,
        });
        setScrollManager(sm)
    }

    return (<>
        {trace && scrollManager && <TraceDetail trace={trace} scrollManager={scrollManager} />}
    </>)
}

export default TraceDetailWrapper



