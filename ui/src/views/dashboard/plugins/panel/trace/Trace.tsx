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

import { Box, Center, HStack } from "@chakra-ui/react"
import { DatasourceType, PanelProps } from "types/dashboard"
import TraceSearchPanel from "./components/SearchPanel"
import logfmtParser from 'logfmt/lib/logfmt_parser';
import { queryJaegerTrace, queryJaegerTraces } from "../../datasource/jaeger/query_runner"
import { useMemo, useState } from "react"
import { TraceData } from "types/plugins/trace"
import TraceSearchResult from "./components/SearchResult"
import transformTraceData from "./utils/transform-trace-data"
import { uniqBy } from "lodash";
import { replaceWithVariables, replaceWithVariablesHasMultiValues } from "utils/variable";
import { getInitTimeRange } from "components/DatePicker/TimePicker";
import React from "react";




const TracePanel = (props: PanelProps) => {
    const [rawTraces, setRawTraces] = useState<TraceData[]>(null)
    const onSearch = async (service, operation, tags, min, max, limit,useLatestTime) => {
        tags = convTagsLogfmt(tags);
        let tr = getInitTimeRange()
        if (!useLatestTime) {
            tr = props.timeRange
        }
        switch (props.panel.datasource.type) {
            case DatasourceType.Jaeger:
                tags = replaceWithVariables(tags)
                min = replaceWithVariables(min)
                max = replaceWithVariables(max)
                limit = replaceWithVariables(limit)
                const services = replaceWithVariablesHasMultiValues(service)
                const operations = replaceWithVariablesHasMultiValues(operation, "all")
                
                const promises = []
                for (const s of services) {
                    for (const o of operations) {
                        promises.push(queryJaegerTraces(props.panel.datasource.id, tr, s, o, tags, min, max, limit))
                    }
                }
                const res = await Promise.all(promises)
                setRawTraces(uniqBy(res.filter(r => r).flat(), t => t.traceID))
                break;

            default:
                setRawTraces([])
                break;
        }

    }

    const onSearchIds = (traceIds) => {
        const ids = traceIds.split(',')
        switch (props.panel.datasource.type) {
            case DatasourceType.Jaeger:
                Promise.all(ids.map(id => queryJaegerTrace(props.panel.datasource.id, id))).then(res => {
                    setRawTraces(res.filter(r => r).flat())
                })
                break;

            default:
                setRawTraces([])
                break;
        }


    }

    const traces = useMemo(() => rawTraces?.map(transformTraceData), [rawTraces])

    return (<>
        {props.panel.datasource.type != DatasourceType.Jaeger ? <Center height="100%">No data</Center> :
            <HStack alignItems="top" px="2" py="1">
                <Box width="400px" pt="2" pl="1">
                    <TraceSearchPanel timeRange={props.timeRange} dashboardId={props.dashboardId} panel={props.panel} onSearch={onSearch} onSearchIds={onSearchIds} />
                </Box>
                <Box width="calc(100% - 300px)">
                    {traces && <TraceSearchResult traces={traces} panel={props.panel} timeRange={props.timeRange} />}
                </Box>
            </HStack>}
    </>)
}

export default TracePanel



export function convTagsLogfmt(tags) {
    if (!tags) {
        return '';
    }


    const data = logfmtParser.parse(tags);
    Object.keys(data).forEach(key => {
        const value = data[key];
        // make sure all values are strings
        // https://github.com/jaegertracing/jaeger/issues/550#issuecomment-352850811
        if (typeof value !== 'string') {
            data[key] = String(value);
        }
    });
    return JSON.stringify(data);
}