import { Box, Button, Flex, HStack, Image, Select, Text, VStack } from "@chakra-ui/react"
import { upperFirst } from "lodash"
import { FaPlus, FaTrashAlt } from "react-icons/fa"
import { DatasourceType, Panel } from "types/dashboard"
import JaegerQueryEditor from "../plugins/datasource/jaeger/Editor"
import PrometheusQueryEditor from "../plugins/datasource/prometheus/Editor"
import TestDataQueryEditor from "../plugins/datasource/testdata/Editor"

interface Props {
    panel: Panel
    onChange: any
}

const EditPanelQuery = ({ panel, onChange }: Props) => {
    const selectDatasource = type => {
        onChange(panel => {
            let exist = false
            for (const ds of panel.datasource) {
                if (ds.type == type) {
                    ds.selected = true
                    exist = true
                } else {
                    ds.selected = false
                }
            }
    
            if (!exist) {
                panel.datasource.push({
                    type: type,
                    selected: true,
                    queryOptions: {
                        interval: '15s'
                    },
                    queries: []
                })
            }
        })
    }
    
    const onAddQuery = () => {
        onChange(panel => {
            const ds = selectedDatasource(panel)
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
                legend: "" ,
                visible: true
            })
        })
    }

    const removeQuery = id => {
        onChange(panel => {
            const ds = selectedDatasource(panel)
            if (!ds.queries) {
                ds.queries = []
            }
    
            ds.queries = ds.queries.filter(q => q.id != id)
        })
    }
    
    const selected = selectedDatasource(panel)

    return (<>
        <Box className="top-gradient-border bordered-left bordered-right" width="fit-content">
            <Text px="2" py="2">Query</Text>
        </Box>
        <Box className="bordered" p="2" borderRadius="0" height="auto">
            <Flex justifyContent="space-between">
                <HStack>
                    <Image width="32px" height="32px" src={`/plugins/datasource/${selected.type}.svg`} />
                    <Select width="fit-content" variant="unstyled" value={selected.type} onChange={e => selectDatasource(e.currentTarget.value)}>
                        {Object.keys(DatasourceType).map((key, index) => {
                            return <option key={index} value={DatasourceType[key]}>{key}</option>
                        })}
                    </Select>
                </HStack>
                <Button leftIcon={<FaPlus />} size="sm" variant="outline" onClick={onAddQuery}> Query</Button>
            </Flex>
            
            <VStack alignItems="left" mt="3" spacing="2">
                {selected.queries?.map((query, index) => {
                    return <Box key={index}>
                        <Flex justifyContent="space-between" className="label-bg" py="1" px="2" mb="1">
                            <Text className="color-text">{String.fromCharCode(query.id)}</Text>
                            <HStack layerStyle="textSecondary">
                                <FaTrashAlt fontSize="12px" cursor="pointer" onClick={() => removeQuery(query.id)}/>
                            </HStack>
                        </Flex>
                        {
                            <Box pl="4"><CustomQueryEditor query={query} selected={selected} onChange={onChange}/></Box>
                        }
                    </Box>
                })}
            </VStack>
        </Box>
    </>)
}

export default EditPanelQuery


const CustomQueryEditor = ({query,onChange,selected}) => {
    const onQueryChange = (query) => {
        onChange(panel => {
            const ds = selectedDatasource(panel)
            for (var i = 0; i < ds.queries.length; i++) {
                if (ds.queries[i].id === query.id) {
                    ds.queries[i] = query
                    break
                }
            }
        })
    }

    switch (selected.type) {
        case DatasourceType.Prometheus:
            return <PrometheusQueryEditor query={query} onChange={onQueryChange} />
        case DatasourceType.TestData:
            return <TestDataQueryEditor query={query} onChange={onQueryChange} />
        case DatasourceType.Jaeger:
            return <JaegerQueryEditor query={query} onChange={onQueryChange} />
        default:
            return <></>
    }
}

const selectedDatasource = (p) => {
    for (const ds of p.datasource) {
        if (ds.selected) {
            return ds
        }
    }
}