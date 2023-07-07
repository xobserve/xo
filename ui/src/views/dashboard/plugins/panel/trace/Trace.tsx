import { Box, Center, HStack } from "@chakra-ui/react"
import { DatasourceType, PanelProps } from "types/dashboard"
import TraceSearchPanel from "./components/SearchPanel"
import logfmtParser from 'logfmt/lib/logfmt_parser';
import { queryJaegerTrace, queryJaegerTraces } from "../../datasource/jaeger/query_runner"
import {  useMemo, useState } from "react"
import { TraceData } from "types/plugins/trace"
import TraceSearchResult from "./components/SearchResult"
import transformTraceData from "./utils/transform-trace-data"
import { flatten, isEmpty } from "lodash";


const TracePanel = (props: PanelProps) => {
    const [rawTraces, setRawTraces] = useState<TraceData[]>(null)
    const onSearch = async (service, operation, tags, min, max, limit) => {
        tags = convTagsLogfmt(tags);
        switch (props.panel.datasource.type) {
            case DatasourceType.Jaeger:
                const res = await queryJaegerTraces(props.panel.datasource.id,props.timeRange, service, operation, tags, min, max, limit)
                setRawTraces(res)
                break;
        
            default:
                setRawTraces([])
                break;
        }

    }

    const onSearchIds = (traceIds) => {
        const ids = traceIds.split(',')
        Promise.all(ids.map(id => queryJaegerTrace(props.panel.datasource.id, id))).then(res => {
            setRawTraces(flatten(res.filter(r => r )))
        })
        
    }

    const traces = useMemo(() => rawTraces?.map(transformTraceData), [rawTraces]) 
    
    return (<>
        {props.panel.datasource.type != DatasourceType.Jaeger ? <Center height="100%">No data</Center> :
            <HStack alignItems="top" px="2" py="1">
                <Box width="400px" pt="2" pl="1">
                    <TraceSearchPanel timeRange={props.timeRange}  dashboardId={props.dashboardId} panel={props.panel} onSearch={onSearch} onSearchIds={onSearchIds}/>
                </Box>
                <Box width="calc(100% - 300px)">
                {traces  && <TraceSearchResult traces={traces}  panel={props.panel} timeRange={props.timeRange}/>}
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