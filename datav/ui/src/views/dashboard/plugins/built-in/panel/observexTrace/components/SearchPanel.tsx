import { Form, FormSection } from "src/components/form/Form"
import InputSelect from "src/components/select/InputSelect"
import { useEffect, useMemo, useRef, useState } from "react"
import { Panel } from "types/dashboard"
import { isEqual } from "lodash"
import { EditorInputItem, EditorNumberItem } from "src/components/editor/EditorItem"
import { Box, Divider, Flex, HStack, Input, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import storage from "utils/localStorage"

import { TimeRange } from "types/time"
import { hasVariableFormat, replaceWithVariablesHasMultiValues } from "utils/variable"
import useBus from "use-bus"
import { ShareUrlEvent } from "src/data/bus-events"
import React from "react";
import { useStore } from "@nanostores/react"
import { tracePanelMsg } from "src/i18n/locales/en"
import { shareUrlParams } from "src/views/dashboard/DashboardShare"
import { isEmpty } from "utils/validate"
import { useSearchParams } from "react-router-dom"
import { $variables } from "src/views/variables/store"
import { getDatasource } from "utils/datasource"
import { MobileBreakpoint } from "src/data/constants"
import { $datasources } from "src/views/datasource/store"
import { addParamToUrl } from "utils/url"
import { PanelType } from "../types"
import { TraceSearchKey } from "../../trace/config/constants"
import { useSearchParam } from "react-use"
import { TraceTagKey } from "../Trace"
import { FaList } from "react-icons/fa"
import { builtinDatasourcePlugins } from "../../../plugins"
import { externalDatasourcePlugins } from "src/views/dashboard/plugins/external/plugins"

interface Props {
    panel: Panel
    onSearch: any
    onSearchIds: any
    dashboardId: string
    timeRange: TimeRange
    traceTagKeys?: TraceTagKey[]
}

// cache services parsed by variables, when a variable changes, we can compare the new parsed result with cache
// and decide whether need to re-query operations
const traceQueryCache = new Map()
const TraceSearchPanel = ({ timeRange, dashboardId, panel, onSearch, onSearchIds, traceTagKeys }: Props) => {
    const [searchParams] = useSearchParams()
    const variables = useStore($variables)
    const t1 = useStore(tracePanelMsg)
    const [searchProvider, setSearchProvider] = useState<string>("")
    const lastSearch = useMemo(() => storage.get(TraceSearchKey + dashboardId + panel.id) ?? {}, [])
    const [initService, initOperation, initTags, initMax, initMin, initLimit] = getInitParams(searchParams, panel, lastSearch)
    const aggregate = useSearchParam("aggregate")
    const groupby = useSearchParam("groupby")


    const initTraceIds = searchParams.get('traceIds')
    const [service, setService] = useState<string>(initService)
    const [operation, setOperation] = useState<string>(initOperation)
    const [tags, setTags] = useState<string>(initTags)
    const [max, setMax] = useState<string>(initMax)
    const [min, setMin] = useState<string>(initMin)
    const [limit, setLimit] = useState<number>(initLimit)
    const [traceIds, setTraceIds] = useState<string>(initTraceIds)
    const [queryCounter, setQueryCounter] = useState(0)
    const datasources = useStore($datasources)
    const ds = getDatasource(panel.datasource.id, datasources)
    const dsPlugin = builtinDatasourcePlugins[ds.type] ?? externalDatasourcePlugins[ds.type]

    useEffect(() => {
        return () => {
            delete traceQueryCache[dashboardId + panel.id]
        }
    }, [])

    const queryH = useRef(null)
    useEffect(() => {
        if (queryH.current) {
            clearTimeout(queryH.current)
        }
        queryH.current = setTimeout(() => {
            if (!isEmpty(traceIds)) {
                onSearchIds(traceIds)
            } else {
                if (service && operation) {
                    onSearch(service, operation, tags, min, max, limit, true, [[aggregate, groupby], false])
                }
            }

            storage.set(TraceSearchKey + dashboardId + panel.id, {
                service, operation, tags, min, max, limit
            })
        }, 500)

    }, [queryCounter, service, operation, tags, min, max, limit, traceIds, timeRange, aggregate, groupby])

    useEffect(() => {
        const query = dsPlugin.replaceQueryWithVariables(service + operation + tags + min + max + limit)

        const cachedQuery = traceQueryCache[dashboardId + panel.id]
        if (!isEqual(query, cachedQuery)) {
            setQueryCounter(queryCounter + 1)
        }
        traceQueryCache[dashboardId + panel.id] = query

    }, [variables])

    useBus(
        ShareUrlEvent,
        () => {
            if (!isEmpty(traceIds)) {
                shareUrlParams['traceIds'] = traceIds
            } else {
                if (!isEmpty(service)) shareUrlParams['service'] = service
                if (!isEmpty(operation)) shareUrlParams['operation'] = operation
                if (!isEmpty(tags)) shareUrlParams['tags'] = tags
                if (!isEmpty(max)) shareUrlParams['max'] = max
                if (!isEmpty(min)) shareUrlParams['min'] = min
                if (!isEmpty(limit)) shareUrlParams['limit'] = limit
            }
        },
        [service, operation, tags, max, min, limit, traceIds]
    )

    const tagsProvider = useMemo(() => {
        if (!traceTagKeys) {
            return null
        }

        const provider = []
        for (const tag of traceTagKeys) {
            let v: string
            if (tag.isColumn) {
                v = tag.name

            } else if (tag.dataType == "resource") {
                v = "resources." + tag.name
            } else {
                v = "attributes." + tag.name
            }

            if (v.toLowerCase().includes(searchProvider.toLowerCase())) {
                provider.push(v)
            }

        }

        return provider
    }, [traceTagKeys, searchProvider])

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    const size = "sm"
    return (<>
        <Form spacing={isLargeScreen ? 4 : 2} fontSize={isLargeScreen ? '0.8rem' : "0.7rem"}>
            <FormSection title="Service" spacing={1}>
                {
                    panel.plugins[PanelType].enableEditService ?
                        <EditorInputItem bordered={false} borderedBottom value={service} onChange={v => {
                            setService(v)
                        }} />
                        : <Input variant="flushed" value={service} disabled size={size} />
                }
            </FormSection>
            <FormSection title="Operation" spacing={1}>
                <EditorInputItem bordered={false} borderedBottom value={operation} onChange={v => setOperation(v)} />
            </FormSection>
            <FormSection title="Tags" spacing={1}>
                <HStack>
                    <EditorInputItem key={tags} bordered={false} borderedBottom value={tags} placeholder={`e.g http.status_code=200 error=true`} onChange={v => setTags(v)} />
                    {tagsProvider && <Popover trigger="click" placement="right" >
                        <PopoverTrigger>
                            <Box><FaList /></Box>
                        </PopoverTrigger>
                        <Portal >
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverBody>
                                    <Input value={searchProvider} onChange={e => setSearchProvider(e.currentTarget.value)} placeholder="search options..." />
                                    <VStack pt="2" alignItems={"left"} h="calc(100vh - 50px)" overflowY="auto">
                                        {tagsProvider.map(t => <Text cursor="pointer" className="hover-text" onClick={() => setTags(tags + " " + t + "=")}>{t}</Text>)}
                                    </VStack>
                                </PopoverBody>
                            </PopoverContent>
                        </Portal>
                    </Popover>}
                </HStack>
            </FormSection>
            <Flex flexDir={isLargeScreen ? "row" : "column"} gap={1}>
                <FormSection title={t1.minDuration} spacing={1}>
                    <EditorInputItem bordered={false} borderedBottom value={min} placeholder="e.g 1.2s,100ms" onChange={v => setMin(v)} />
                </FormSection>
                <FormSection title={t1.maxDuration} spacing={1}>
                    <EditorInputItem bordered={false} borderedBottom value={max} placeholder="e.g 1.2s,100ms" onChange={v => setMax(v)} />
                </FormSection>
            </Flex>
            <FormSection title={t1.limitResults} spacing={1}>
                <EditorNumberItem bordered={false} value={limit} min={0} onChange={v => setLimit(v)} size="md" />
            </FormSection>
            <Divider pt="2" />
            <FormSection title="Trace ids" spacing={1} desc={t1.traceIdsTips}>
                <EditorInputItem key={traceIds} placeholder={t1.traceIdsInputTips} value={traceIds} onChange={v => { setTraceIds(v); addParamToUrl({ traceIds: v }) }} size="md" />
            </FormSection>
            <Flex flexDir={isLargeScreen ? "row" : "column"} justifyContent="space-between" gap={3} pt="2">
                {/* <Button variant="outline" width={isLargeScreen ? "120px" : null} size={size} onClick={onClickSearch}>{isLargeScreen ? t1.findTraces : "Search"}</Button> */}
                {/* <HStack spacing={1}>
                    <Checkbox isChecked={useLatestTime} onChange={e => setUseLatestTime(e.currentTarget.checked)} />
                    <Text opacity="0.7">{t1.useLatestTime}</Text>
                </HStack> */}
            </Flex>

        </Form>
    </>)
}

export default TraceSearchPanel


const getInitParams = (searchParams, panel, lastSearch) => {
    let service
    const urlService = searchParams.get('service')
    if (!isEmpty(urlService)) {
        service = urlService
    } else if (!panel.plugins[PanelType].enableEditService) {
        service = panel.plugins[PanelType].defaultService
    } else {
        service = lastSearch.service ?? null
    }

    const operation = searchParams.get('operation') ?? (lastSearch.operation ?? null)
    const tags = searchParams.get('tags') ?? (lastSearch.tags ?? '')
    const max = searchParams.get('max') ?? (lastSearch.max ?? '')
    const min = searchParams.get('min') ?? (lastSearch.min ?? '')
    const limit = searchParams.get('limit') ?? (lastSearch.limit ?? 100)
    return [service, operation, tags, max, min, limit]
}