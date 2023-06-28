import { Box, Button, Flex, HStack, Image, Select, Text, VStack } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { FaAngleDown, FaAngleRight, FaArrowCircleDown, FaArrowRight, FaCog, FaPlus, FaTrashAlt } from "react-icons/fa"
import { DatasourceType, Panel, PanelQuery } from "types/dashboard"
import JaegerQueryEditor from "../plugins/datasource/jaeger/Editor"
import PrometheusQueryEditor from "../plugins/datasource/prometheus/Editor"
import TestDataQueryEditor from "../plugins/datasource/testdata/Editor"
import { initDatasource } from "src/data/panel/initPanel"
import Label from "components/form/Label"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import { calculateInterval } from "utils/datetime/range"
import { getInitTimeRange } from "components/TimePicker"
import { datasources } from "../Dashboard"
import { Datasource } from "types/datasource"
import HttpQueryEditor from "../plugins/datasource/http/Editor"

interface Props {
    panel: Panel
    onChange: any
}

const EditPanelQuery = (props: Props) => {
    const { panel, onChange } = props
    const selectDatasource = (id) => {
       
        onChange((panel: Panel) => {
            const type = datasources.find(ds => ds.id == id).type
            panel.datasource = { ...initDatasource, type: type,id: id }
        })
    }

    const onAddQuery = () => {
        onChange((panel: Panel) => {
            const ds = panel.datasource
            if (!ds.queries) {
                ds.queries = []
            }

            let id = 65; // from 'A' to 'Z'
            for (const q of ds.queries) {
                if (q.id >= id) {
                    id = q.id + 1
                }
            }


            ds.queries.push({
                id: id,
                metrics: "",
                legend: "",
                visible: true,
                data: {}
            })
        })
    }

    const removeQuery = id => {
        onChange((panel: Panel) => {
            const ds = panel.datasource
            if (!ds.queries) {
                ds.queries = []
            }

            ds.queries = ds.queries.filter(q => q.id != id)
        })
    }


    return (<>
        <Box className="top-gradient-border bordered-left bordered-right" width="fit-content">
            <Text px="2" py="2">Query</Text>
        </Box>
        <Box className="bordered" p="2" borderRadius="0" height="100%">
            <Flex justifyContent="space-between"  alignItems="start">
                <HStack>
                    <Image width="30px" height="30px" src={`/plugins/datasource/${panel.datasource.type}.svg`} />
                    <Select width="fit-content" variant="unstyled" value={panel.datasource.id} onChange={e => {
                        selectDatasource(e.currentTarget.value)
                    }}>
                        { datasources.map((ds:Datasource)=> {
                            return <option key={ds.id} value={ds.id}>{ds.name}</option>
                        })}
                    </Select>
                </HStack>
                <DatasourceQueryOption {...props} />
            </Flex>

            <VStack alignItems="left" mt="3" spacing="2">
                {panel.datasource.queries?.map((query, index) => {
                    return <Box key={index}>
                        <Flex justifyContent="space-between" className="label-bg" py="1" px="2" mb="1">
                            <Text className="color-text">{String.fromCharCode(query.id)}</Text>
                            <HStack layerStyle="textSecondary">
                                <FaTrashAlt fontSize="12px" cursor="pointer" onClick={() => removeQuery(query.id)} />
                            </HStack>
                        </Flex>
                        {
                            <Box pl="4"><CustomQueryEditor query={query} selected={panel.datasource} onChange={onChange} /></Box>
                        }
                    </Box>
                })}
            </VStack>
            <Button leftIcon={<FaPlus />} size="sm" variant="outline" onClick={onAddQuery} mt="4"> Query</Button>
        </Box>
    </>)
}

export default EditPanelQuery


const DatasourceQueryOption = ({ panel, onChange }: Props) => {
    const [expanded, setExpanded] = useState(false)
    return (
        <VStack alignItems="end" mt="4px">
  
                <HStack color="brand.500" fontSize=".9rem" spacing={1} cursor="pointer" onClick={() => setExpanded(!expanded)} width="fit-content">
                    {expanded ? <FaAngleDown /> : <FaAngleRight />}
                    <Text fontWeight="500">Query options</Text>
                </HStack>
            {
                expanded && <VStack alignItems="center" mt="1" position="relative" >
                    <HStack spacing={1}>
                        <Label width="170px" desc="The maximum data points per series. Used directly by some data sources and used in calculation of auto interval. ">Max data points</Label>
                        <Box width="100px"><EditorNumberItem min={100} max={2000} step={50} value={panel.datasource.queryOptions.maxDataPoints} onChange={v => {
                        onChange((panel: Panel) => {
                            panel.datasource.queryOptions.maxDataPoints = v
                        })
                    }} /></Box>
                    </HStack>
                    <HStack spacing={1}>
                        <Label width="170px" desc="A lower limit for the interval. Recommended to be set to write frequency, e.g Prometheus defaults scraping data every 15 seconds, you can set this to '15s'">Min interval </Label>
                        <Box width="100px"><EditorInputItem value={panel.datasource.queryOptions.minInterval} onChange={v => {
                        onChange((panel: Panel) => {
                            panel.datasource.queryOptions.minInterval = v
                        })
                    }} /></Box>
                    </HStack>
                    <HStack spacing={1}>
                        <Label width="170px" desc="Final interval is caculated based on the current time range, max data points and the min interval, it's sent to datasource, e.g final interval will be directly passed as the step option that Prometheus requires">Final interval </Label>
                        <Text width="100px" pl="2">{calculateInterval(getInitTimeRange(), panel.datasource.queryOptions.maxDataPoints,panel.datasource.queryOptions.minInterval ).interval}</Text>
                    </HStack>
                </VStack>
            }
        </VStack>
    )
}
const CustomQueryEditor = ({ query, onChange, selected }) => {
    const onQueryChange = (query: PanelQuery) => {
        onChange((panel: Panel) => {
            const ds = panel.datasource
            for (var i = 0; i < ds.queries.length; i++) {
                if (ds.queries[i].id === query.id) {
                    ds.queries[i] = query
                    break
                }
            }
        })
    }

    //@needs-update-when-add-new-datasource
    switch (selected.type) {
        case DatasourceType.Prometheus:
            return <PrometheusQueryEditor datasource={selected} query={query} onChange={onQueryChange} />
        case DatasourceType.TestData:
            return <TestDataQueryEditor datasource={selected} query={query} onChange={onQueryChange} />
        case DatasourceType.Jaeger:
            return <JaegerQueryEditor datasource={selected} query={query} onChange={onQueryChange} />
        case DatasourceType.ExternalHttp:
            return <HttpQueryEditor datasource={selected} query={query} onChange={onQueryChange} />
        default:
            return <></>
    }
}
