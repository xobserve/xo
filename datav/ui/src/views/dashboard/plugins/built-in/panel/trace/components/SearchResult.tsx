import { Panel } from "types/dashboard"
import { Trace } from "src/views/dashboard/plugins/built-in/panel/trace/types/trace"
import SearchResultPlot from "./SearchResultPlot"
import { TimeRange } from "types/time"
import { Box, Button, Flex, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Select, StackDivider, Text, VStack, chakra, useMediaQuery, Tooltip } from "@chakra-ui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { clone, concat, remove, set } from "lodash"
import { FaInfoCircle, FaTimes } from "react-icons/fa"
import React from "react";
import { useStore } from "@nanostores/react"
import { tracePanelMsg } from "src/i18n/locales/en"
import CustomScrollbar from "src/components/CustomScrollbar/CustomScrollbar"
import { MobileBreakpoint } from "src/data/constants"
import { $datasources } from "src/views/datasource/store"
import { Datasource } from "types/datasource"
import { getDatasource } from "utils/datasource"
import TraceCompare from "../../trace/components/TraceCompare/TraceCompare"
import TraceCard from "../../trace/components/TraceCard"
import ErrorOkChart from "src/views/dashboard/plugins/components/charts/ErrorOkChart"
import { addParamToUrl } from "utils/url"
import { useSearchParam } from "react-use"
import InputSelect from "components/select/InputSelect"

interface Props {
    dashboardId: string
    teamId: number
    panel: Panel
    traces: Trace[]
    timeRange: TimeRange
    height: number
    traceChart?: any
    traceChartOptions?: any
    groupByOptions?: { label: string; value: string }[]
}

const TraceSearchResult = (props: Props) => {
    const { dashboardId, teamId, panel, traces, timeRange, height, traceChart, traceChartOptions, groupByOptions = [] } = props
    const t1 = useStore(tracePanelMsg)
    const datasources = useStore($datasources)
    const [selectedTraces, setSelectedTraces] = useState<Trace[]>([])
    const [sort, setSort] = useState(traceSortTypes[0].value)
    const [comparison, setComparison] = useState<string[]>([])
    const [chartType, setChartType] = useState<"plot" | "graph">(traceChart ? "graph" : "plot")
    const initAggregate = useSearchParam("aggregate")
    const initGroupby = useSearchParam("groupby")
    const [aggregate, setAggregate] = useState(initAggregate ?? aggregateFunctions[0].value)
    const [groupby, setGroupby] = useState(initGroupby ?? null)



    useEffect(() => {
        setSelectedTraces(clone(traces))
        setComparison([])
    }, [traces])

    const maxDuration = useMemo(() => Math.max(...traces.map(trace => trace.duration)), [traces])

    const onSelect = useCallback((traceIds: string[]) => {
        const selected = traces.filter(trace => traceIds.includes(trace.traceID))
        setSelectedTraces(selected)
    }, [])

    const sortedTraces = useMemo(() => {
        switch (sort) {
            case "recent":
                return selectedTraces.sort((a, b) => b.startTime - a.startTime)
            case "mostErrors":
                return selectedTraces.sort((a, b) => b.errorsCount - a.errorsCount)
            case "longest":
                return selectedTraces.sort((a, b) => b.duration - a.duration)
            case "shortest":
                return selectedTraces.sort((a, b) => a.duration - b.duration)
            case "mostSpans":
                return selectedTraces.sort((a, b) => b.services.reduce((t, e) => e.numberOfSpans + t, 0) - a.services.reduce((t, e) => e.numberOfSpans + t, 0))
            case "leastSpans":
                return selectedTraces.sort((a, b) => a.services.reduce((t, e) => e.numberOfSpans + t, 0) - b.services.reduce((t, e) => e.numberOfSpans + t, 0))
            default:
                return traces
        }
    }, [selectedTraces, sort])

    const onTraceChecked = traceId => {

        if (comparison.includes(traceId)) {
            remove(comparison, i => i == traceId)
        } else {
            comparison.push(traceId)
        }

        setComparison([...comparison])
    }

    const comparedTraces = comparison.map(traceId => {
        return traces.find(t => t.traceID == traceId)
    }).filter(t => t)

    const removeFromCompare = traceId => {
        remove(comparison, i => i == traceId)
        setComparison([...comparison])
    }

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    const plotHeight = traceChartOptions?.height ?? 200

    const ds = getDatasource(panel.datasource.id, datasources)

    const onTraceClick = (trace) => {
        if (ds) {
            window.open(`/trace/${trace.traceID}/${ds.id}?dashboardId=${dashboardId}&panelId=${panel.id}&teamId=${teamId}`)
        }
    }

    const totalTraces = useMemo(() => {
        if (aggregate != "total-count") {
            return null
        }
        if (!traceChart) {
            return 0
        }
        const d: any[] = traceChart.data
        const total = d.reduce((t, b) => {
            for (let i = 1; i < b.length; i++) {
                t += b[i]
            }
            return t
        }, 0)
        return total
    }, [traceChart])

    return (<>
        <Box pl="2">
            {(chartType == "graph" && traceChart) && <Box height={plotHeight}>
                {traceChart && <ErrorOkChart data={traceChart} onClick={null} totalCount={totalTraces} displayCount={traces?.length} options={traceChartOptions} isTimeUnit={aggregate != "total-count" && aggregate != "rate"}/>}
            </Box>}
            {(chartType == "plot" || !traceChart) && <SearchResultPlot traces={traces} timeRange={timeRange} onSelect={onSelect} height={plotHeight + 3} />}
            <Box pl="2" pr="20px" pt="4">
                <Flex flexDirection={isLargeScreen ? "row" : "column"} alignItems={isLargeScreen ? "center" : "start"} justifyContent="space-between" mb="1" fontSize={isLargeScreen ? null : "xs"}>
                    <HStack height="40px" fontSize="0.9rem">
                        {selectedTraces.length != traces.length ? <Text>{selectedTraces.length} {t1.tracesSelected}</Text> : <Text>{selectedTraces.length} Results</Text>}
                        {selectedTraces.length != traces.length && <Button size="sm" variant="outline" onClick={() => setSelectedTraces(clone(traces))}>{t1.clearSelection}</Button>}
                    </HStack>
                    {
                        comparison.length > 0 && <HStack textStyle="title">
                            <Text><ComparisonTraces panel={panel} removeFromCompare={removeFromCompare} comparedTraces={comparedTraces} maxDuration={maxDuration} datasources={datasources} /> {t1.selectForCompre}</Text>
                            <TraceCompare traces={comparedTraces} />
                        </HStack>
                    }
                    <Flex alignItems={isLargeScreen ? "center" : "start"} flexDirection={isLargeScreen ? "row" : "column"}>
                        {/* <Text minWidth="fit-content" fontSize="0.9rem">排序</Text> */}
                        <Select width="fit-content" variant="unstyled" size={isLargeScreen ? "sm" : "xs"} value={sort} onChange={e => setSort(e.currentTarget.value)}>
                            {traceSortTypes.map(sortType => <option key={sortType.value} value={sortType.value}>{t1[sortType.value]}</option>)}
                        </Select>
                        {traceChartOptions && <HStack fontSize="0.9rem">
                            <Select minWidth="fit-content" variant="unstyled" size={isLargeScreen ? "sm" : "xs"} value={chartType} onChange={e => setChartType(e.currentTarget.value as any)}>
                                <option value="plot">Results scatter</option>
                                <option value="graph">Hits graph</option>
                            </Select>
                            {chartType == "graph" && <>
                                <Text minWidth="fit-content">{t1.aggregate}</Text>
                                <Select minWidth="fit-content" variant="unstyled" size="sm" value={aggregate} onChange={e => {
                                    setAggregate(e.currentTarget.value)
                                    addParamToUrl({ aggregate: e.currentTarget.value })
                                }}>
                                    {
                                        aggregateFunctions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)
                                    }
                                </Select>
                                <Text minWidth="fit-content">{t1.groupBy}</Text>
                                <InputSelect variant="unstyled" size="sm" value={groupby} options={groupByOptions} onChange={v => {
                                    setGroupby(v)
                                    addParamToUrl({ groupby: v })
                                }} />
                            </>}
                        </HStack>

                        }
                        {chartType == "graph" && <Tooltip label="You can access resources or attributes fields as this: resources.observex.collector.id">
                            <Box><FaInfoCircle className="action-icon" /></Box>
                        </Tooltip>}
                    </Flex>
                </Flex>
                <VStack alignItems="left" maxH={height - plotHeight - 58}>
                    <CustomScrollbar>
                        {sortedTraces.map(trace => <TraceCard panel={panel} key={trace.traceID} trace={trace} maxDuration={maxDuration} checked={comparison.includes(trace.traceID)} checkDisabled={comparison.length >= 2 && !comparison.includes(trace.traceID)} onChecked={onTraceChecked} onClick={() => onTraceClick(trace)} />)}
                    </CustomScrollbar>
                </VStack>
            </Box>
        </Box>

    </>)
}

export default TraceSearchResult


const ComparisonTraces = ({panel, comparedTraces, maxDuration, removeFromCompare, datasources }: {panel: Panel; comparedTraces: Trace[], maxDuration: number, removeFromCompare: any, datasources: Datasource[] }) => {
    return (<>
        <Popover trigger="hover" placement="left">
            <PopoverTrigger>
                <chakra.span color="brand.500" cursor="pointer">{comparedTraces.length}</chakra.span>
            </PopoverTrigger>
            <PopoverContent minWidth="500px">
                <PopoverArrow />
                <PopoverBody>
                    <VStack alignItems="left" divider={<StackDivider />}>
                        {comparedTraces.map(trace => {
                            return trace && <HStack spacing={2}>
                                <TraceCard panel={panel} trace={trace} maxDuration={maxDuration} simple />
                                <FaTimes cursor="pointer" onClick={() => removeFromCompare(trace.traceID)} />
                            </HStack>
                        })}
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    </>)
}
const traceSortTypes = [
    {
        label: "Most Recent",
        value: "recent"
    },
    {
        label: "Most Errors",
        value: "mostErrors"
    },
    {
        label: "Longest Duruation",
        value: "longest"
    },
    {
        label: "Shortest Duruation",
        value: "shortest"
    },
    {
        label: "Most Spans",
        value: "mostSpans"
    },
    {
        label: "Least Spans",
        value: "leastSpans"
    }
]


const aggregateFunctions = [
    // {
    //     label: "Suc/Err count",
    //     value: "count"
    // },
    {
        label: "Count",
        value: "total-count"
    },
    {
        label: "Rate per second",
        value: "rate"
    },
    {
        label: "Sum duration",
        value: "sum"
    },
    {
        label: "Avg duration",
        value: "avg"
    },
    {
        label: "Max duration",
        value: "max"
    },
    {
        label: "Min duration",
        value: "min"
    },
    {
        label: "p50 duration",
        value: "p50"
    },
    {
        label: "p90 duration",
        value: "p90"
    },
    {
        label: "p95 duration",
        value: "p95"
    },
    {
        label: "p99 duration",
        value: "p99"
    },
]


const baseGroupBy = [
    {
        label: "None",
        value: ""
    },
    {
        label: "Service name",
        value: "serviceName"
    },
    {
        label: "Operation name",
        value: "name"
    },
]