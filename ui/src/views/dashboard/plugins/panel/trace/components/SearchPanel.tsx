import { Form, FormSection } from "components/form/Form"
import InputSelect from "components/select/InputSelect"
import { use, useEffect, useMemo, useState } from "react"
import { DatasourceType, Panel } from "types/dashboard"
import { queryJaegerOperations, queryJaegerServices } from "../../../datasource/jaeger/query_runner"
import { isEmpty, isEqual, set, sortBy, uniq } from "lodash"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import { Button, Checkbox, Divider, HStack, Text } from "@chakra-ui/react"
import storage from "utils/localStorage"
import { TraceSearchKey } from "../config/constants"
import { TimeRange } from "types/time"
import { hasVariableFormat, replaceWithVariablesHasMultiValues } from "utils/variable"
import useBus from "use-bus"
import { VariableChangedEvent } from "src/data/bus-events"
import React from "react";

interface Props {
    panel: Panel
    onSearch: any
    onSearchIds: any
    dashboardId: string
    timeRange: TimeRange
}

// cache services parsed by variables, when a variable changes, we can compare the new parsed result with cache
// and decide whether need to re-query operations
const traceServicesCache = new Map() 
const TraceSearchPanel = ({ timeRange,dashboardId, panel, onSearch,onSearchIds }: Props) => {
    const [inited, setInited] = useState(false)
    const lastSearch = useMemo(() => storage.get(TraceSearchKey + dashboardId + panel.id)??{} ,[])
    const [services, setServices] = useState([])
    const [service, setService] = useState<string>(lastSearch.service??null)
    const [operations, setOperations] = useState([])
    const [operation, setOperation] = useState<string>(lastSearch.operation??null)
    const [tags, setTags] = useState<string>(lastSearch.tags??'')
    const [max, setMax] = useState<string>(lastSearch.max??'')
    const [min, setMin] = useState<string>(lastSearch.min??'')
    const [limit, setLimit] = useState(lastSearch.limit??20)
    const [traceIds, setTraceIds] = useState<string>()
    const [useLatestTime, setUseLatestTime] = useState(true)
    useEffect(() => {
        return () => {
            delete traceServicesCache[dashboardId + panel.id]
        }
    },[])

    useEffect(() => {
        if (inited) {
            if (!isEmpty(traceIds)) {
                onSearchIds(traceIds)
            } else {
                if (service && operation) {
                    onSearch(service, operation , tags, min, max, limit)
                }
            }    
        }
    },[timeRange])

    useEffect(() => {
        loadServices()
    }, [panel.datasource.type])

    useEffect(() => {
        if (service) {
            loadOperations()
        } else {
            setOperations([])
        }
    }, [service])
    
    useBus(
        VariableChangedEvent,
        () => {
            if (hasVariableFormat(operation)) {
                return 
            }
      
            const services = replaceWithVariablesHasMultiValues(service)
            const cachedServices = traceServicesCache[dashboardId+panel.id]
            if (!isEqual(services, cachedServices)) {
                loadOperations()
            }
        },
        [operation]
    )

    const loadServices = async () => {
        switch (panel.datasource.type) {
            case DatasourceType.Jaeger:
                const res = await queryJaegerServices(panel.datasource.id)
                const ss = sortBy(res)
                setServices(ss)
                if (ss.length > 0) {
                    if (!service) {
                        setService(ss[0])
                        onSearch(ss[0],'all' , tags, min, max, limit)
                    } else {
                        onSearch(service, operation ?? 'all' , tags, min, max, limit)      
                    }
                }

                setTimeout(() => {
                    setInited(true)
                },500)
          
                break;

            default:
                break;
        }
    }

    const loadOperations = async (s?) => {
        switch (panel.datasource.type) {
            case DatasourceType.Jaeger:
                const services = s ?? replaceWithVariablesHasMultiValues(service)
                traceServicesCache[dashboardId + panel.id] = services
                const res = await Promise.all(services.map(service => queryJaegerOperations(panel.datasource.id, service)))
               
                const ss = sortBy(uniq(res.filter(r => r).flat()))
                setOperations(['all'].concat(ss))
                    
                if (!hasVariableFormat(operation)) {
                    if (!operation || !ss.includes(operation)) {
                        setOperation('all')
                    }
                }
             
                break;

            default:
                break;
        }
    }
    
    const onClickSearch = () => {
        if (!isEmpty(traceIds)) {
            onSearchIds(traceIds)
        } else {
            onSearch(service,operation,tags,min,max,limit,useLatestTime)
            storage.set(TraceSearchKey + dashboardId + panel.id, {
                service, operation,tags,min,max,limit
            })
        }
    }

    return (<>
        <Form spacing={4}>
            <FormSection title="Service" titleSize="0.85rem" spacing={1}>
                <InputSelect value={service} options={services.map(s => ({ label: s, value: s }))} size="md" onChange={v => setService(v)} />
            </FormSection>
            <FormSection title="Operation" titleSize="0.85rem" spacing={1}>
                <InputSelect value={operation} options={operations.map(s => ({ label: s, value: s }))} size="md" onChange={v => setOperation(v)} />
            </FormSection>
            <FormSection title="Tags" titleSize="0.85rem" spacing={1}>
                <EditorInputItem value={tags} placeholder={`e.g {"error":"true", "http.status.code":"200"}`} onChange={v => setTags(v)} />
            </FormSection>
            <HStack>
                <FormSection title="Max duration" titleSize="0.85rem" spacing={1}>
                    <EditorInputItem value={max} placeholder="e.g 1.2s,100ms" onChange={v => setMax(v)} />
                </FormSection>
                <FormSection title="Min duration" titleSize="0.85rem" spacing={1}>
                    <EditorInputItem value={min} placeholder="e.g 1.2s,100ms" onChange={v => setMin(v)} />
                </FormSection>
            </HStack>
            <FormSection title="Limit Results" titleSize="0.85rem" spacing={1}>
                <EditorNumberItem value={limit} min={0} onChange={v => setLimit(v)} size="md"/>
            </FormSection>
            <Divider pt="2"/>
            <FormSection title="Trace ids" titleSize="0.85rem" spacing={1} desc="Searching by trace ids has the highest priority, so if you want to search with options, leave this empty">  
                <EditorInputItem placeholder="search with trace ids, separated with comma" value={traceIds} onChange={v => setTraceIds(v)} size="md"/>
            </FormSection>
            <HStack>
                <Button  width="150px" onClick={onClickSearch}>Find traces</Button>
                <Checkbox isChecked={useLatestTime} onChange={e => setUseLatestTime(e.currentTarget.checked)} />
                <Text textStyle="annotation">Use latest time</Text>
            </HStack>
           
        </Form>
    </>)
}

export default TraceSearchPanel
