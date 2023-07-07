import { Form, FormSection } from "components/form/Form"
import FormItem from "components/form/Item"
import InputSelect from "components/select/InputSelect"
import { use, useEffect, useState } from "react"
import { DatasourceType, Panel } from "types/dashboard"
import { queryJaegerOperations, queryJaegerServices } from "../../../datasource/jaeger/query_runner"
import { set, sortBy } from "lodash"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import { Button, HStack } from "@chakra-ui/react"

interface Props {
    panel: Panel
    onSearch: any
}
const TraceSearchPanel = ({ panel, onSearch }: Props) => {
    const [services, setServices] = useState([])
    const [service, setService] = useState<string>(null)
    const [operations, setOperations] = useState([])
    const [operation, setOperation] = useState<string>(null)
    const [tags, setTags] = useState<string>('')
    const [max, setMax] = useState<string>('')
    const [min, setMin] = useState<string>('')
    const [limit, setLimit] = useState(20)

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
                    setService(ss[0])
                }
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
                setOperation('all')
                onSearch(service, 'all', tags, min, max, limit)
                break;

            default:
                break;
        }
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
                <EditorNumberItem value={limit} min={0} onChange={v => setTags(v)} size="md"/>
            </FormSection>
            <Button  width="150px" onClick={() => onSearch(service,operation,tags,min,max,limit)}>Find traces</Button>
        </Form>
    </>)
}

export default TraceSearchPanel