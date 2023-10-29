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

import React from "react";
import { Box, Center, HStack, useMediaQuery } from "@chakra-ui/react"
import { PanelProps } from "types/dashboard"
import TraceSearchPanel from "./components/SearchPanel"
import logfmtParser from 'logfmt/lib/logfmt_parser';
import { queryJaegerTrace } from "../../datasource/jaeger/query_runner"
import { memo, useEffect, useMemo, useState } from "react"
import { Trace, TraceData } from "src/views/dashboard/plugins/built-in/panel/trace/types/trace"
import TraceSearchResult from "./components/SearchResult"
import transformTraceData from "./utils/transform-trace-data"
import { cloneDeep, uniqBy } from "lodash";
import { replaceWithVariables } from "utils/variable";
import { getNewestTimeRange } from "src/components/DatePicker/TimePicker";
import { getDatasource } from "utils/datasource";
import CustomScrollbar from "src/components/CustomScrollbar/CustomScrollbar";
import { MobileBreakpoint } from "src/data/constants";
import { isTraceData } from "./utils/trace";
import { isEmpty } from "utils/validate";
import { useStore } from "@nanostores/react";
import { $datasources } from "src/views/datasource/store";
import { DatasourceTypeTestData } from "../../datasource/testdata/types";
import { DatasourceTypeJaeger } from "../../datasource/jaeger/types";
import { builtinDatasourcePlugins } from "../../plugins";
import { externalDatasourcePlugins } from "../../../external/plugins";
import { calculateInterval, intervalToMs } from "utils/datetime/range";
import { DatasourceTypeDatav } from "../../datasource/datav/types";
import { durationToMilliseconds } from "utils/date";
import { convTagsLogfmt } from "../trace/Trace";



const TracePanelWrapper = memo((props: PanelProps) => {
    // const ds = getDatasource(props.panel.datasource.id)

    const d = props.data?.flat()
    if (!isEmpty(d) && !isTraceData(d)) {
        return (<Center height="100%">Data format not supported!</Center>)
    }

    return (<>
        {
            // (ds.type != DatasourceType.Jaeger && ds.type != DatasourceType.TestData)
            //     ?
            //     <Center height="100%">Trace panel only support Jaeger and Testdata datasource</Center>
            //     :
            <TracePanel {...props} />
        }
    </>
    )
})
export default TracePanelWrapper


const TracePanel = (props: PanelProps) => {
    const { panel } = props
    const [traces, setTraces] = useState<Trace[]>(null)
    const datasources = useStore($datasources)
    const ds = getDatasource(props.panel.datasource.id, datasources)
    const dsPlugin = builtinDatasourcePlugins[ds.type] ?? externalDatasourcePlugins[ds.type]
    useEffect(() => {
        if (ds.type == DatasourceTypeTestData) {
            onSearch(null, null, null, null, null, null, true)
        }
    }, [ds.type, props.data]
    )
    const onSearch = async (service, operation, tags, min, max, limit, useLatestTime) => {
        tags = convTagsLogfmt(tags);
        let tr = getNewestTimeRange()
        if (!useLatestTime) {
            tr = props.timeRange
        }
        switch (ds.type) {
            case DatasourceTypeDatav:
                tags = replaceWithVariables(tags)
                min = !isEmpty(min) ? durationToMilliseconds(replaceWithVariables(min)) : min
                max = durationToMilliseconds(replaceWithVariables(max))
                limit = replaceWithVariables(limit)
                const services = dsPlugin.replaceQueryWithVariables(service)
                const operations = dsPlugin.replaceQueryWithVariables(operation)

                const query = cloneDeep(panel.datasource.queries[0])

                const res = await dsPlugin.runQuery(panel, query, props.timeRange, ds, { tags, min, max, limit, service: services, operation: operations })
                setTraces(transformTraces(res.data.traces))
                break;
            case DatasourceTypeTestData:
                setTraces(props.data)
                break
            default:
                setTraces([])
                break;
        }

    }

    const onSearchIds = async (traceIds) => {
        const query = cloneDeep(panel.datasource.queries[0])

        const res = await dsPlugin.runQuery(panel, query, props.timeRange, ds, { traceIds })
        setTraces(res.data.traces)
    }


    const resultHeight = props.height - 7
    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    const searchPanelWidth = isLargeScreen ? "400px" : "140px"

    console.log("here33333:", traces)
    return (<>
        {
            <HStack alignItems="top" px="2" py="1" spacing={isLargeScreen ? 6 : 2}>
                <Box width={searchPanelWidth} pt="2" pl="1" maxH={props.height} px={isLargeScreen ? 4 : 0}>
                    <CustomScrollbar>
                        <TraceSearchPanel timeRange={props.timeRange} dashboardId={props.dashboardId} panel={props.panel} onSearch={onSearch} onSearchIds={onSearchIds} />
                    </CustomScrollbar>
                </Box>
                <Box width={`calc(100% - ${searchPanelWidth})`} maxH={resultHeight}>
                    <CustomScrollbar>
                        {traces && <TraceSearchResult traces={traces} panel={props.panel} dashboardId={props.dashboardId} teamId={props.teamId} timeRange={props.timeRange} height={resultHeight} />}
                    </CustomScrollbar>
                </Box>
            </HStack>}
    </>)
}

// services: { name: string; numberOfSpans: number }[];
// errorsCount?: number;
// errorServices?: Set<string>


// duration
// : 
// 769650
// services
// : 
// [{name: "frontend", numSpans: 24, errors: 0}, {name: "redis", numSpans: 14, errors: 3},…]
// startTime
// : 
// 1698558040663876
// statusCode
// : 
// "200"
// traceID
// : 
// "00000000000000006faf8a8c9c5de30e"
// traceName
// : 
// "HTTP GET /dispatch"
const transformTraces = (traces: any[]): Trace[] => {
    for (const trace of traces) {
        const services = []
        const errorServices = new Set<string>()
        let errorsCount = 0
        for (const service of trace.services) {
            services.push({ name: service.name, numberOfSpans: service.numSpans })
            if (service.errors > 0) {
                errorServices.add(service.name)
                errorsCount += service.errors
            }
        }

        trace.services = services
        trace.errorServices = errorServices
        trace.errorsCount = errorsCount
    }

    return traces
}