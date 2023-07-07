import { Form, FormSection } from "components/form/Form"
import FormItem from "components/form/Item"
import InputSelect from "components/select/InputSelect"
import { use, useEffect, useMemo, useState } from "react"
import { DatasourceType, Panel } from "types/dashboard"
import { queryJaegerOperations, queryJaegerServices } from "../../../datasource/jaeger/query_runner"
import { set, sortBy } from "lodash"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import { Button, HStack } from "@chakra-ui/react"
import storage from "utils/localStorage"
import { TraceSearchKey } from "../config/constants"
import { TimeRange } from "types/time"

interface Props {
    panel: Panel
    onSearch: any
    dashboardId: string
    timeRange: TimeRange
}

const TraceSearchPanel = ({ timeRange,dashboardId, panel, onSearch }: Props) => {
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

    useEffect(() => {
        if (inited) {
            if (service && operation) {
                console.log("here3333333 on time range changed, search:")
                onSearch(service, operation , tags, min, max, limit)
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

    const loadOperations = async () => {
        switch (panel.datasource.type) {
            case DatasourceType.Jaeger:
                const res = await queryJaegerOperations(panel.datasource.id, service)
                const ss = sortBy(res)
                setOperations(['all'].concat(ss))
                if (!operation) {
                    setOperation('all')
                }
                break;

            default:
                break;
        }
    }
    
    const onClickSearch = () => {
        onSearch(service,operation,tags,min,max,limit)
        storage.set(TraceSearchKey + dashboardId + panel.id, {
            service, operation,tags,min,max,limit
        })
    }

    return (<>
        <Form spacing={6}>
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
            <Button  width="150px" onClick={onClickSearch}>Find traces</Button>
        </Form>
    </>)
}

export default TraceSearchPanel