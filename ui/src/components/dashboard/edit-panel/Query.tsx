import { Box, Button, Flex, HStack, Image, Select, Text, VStack } from "@chakra-ui/react"
import { upperFirst } from "lodash"
import { FaPlus } from "react-icons/fa"
import { DatasourceType, Panel } from "types/dashboard"

interface Props {
    panel: Panel
    onChange: any
}

const EditPanelQuery = ({ panel, onChange }: Props) => {
    const selectedDatasource = () => {
        for (const ds of panel.datasource) {
            if (ds.selected) {
                return ds.type
            }
        }
    }

    const selectDatasource = type => {
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
                }
            })
        }

        onChange(panel)
    }

    return (<>
        <Box className="top-gradient-border bordered-left bordered-right" width="fit-content">
            <Text px="2" py="2">Query</Text>
        </Box>
        <Box className="bordered" p="2" borderRadius="0" height="auto">
            <Flex justifyContent="space-between">
                <HStack>
                    <Image width="32px" height="32px" src={`/plugins/datasource/${selectedDatasource()}.svg`} />
                    <Select width="fit-content" variant="unstyled" value={selectedDatasource()} onChange={e => selectDatasource(e.currentTarget.value)}>
                        {Object.keys(DatasourceType).map((type, index) => {
                            return <option key={index} value={type}>{upperFirst(type)}</option>
                        })}
                    </Select>
                </HStack>
                <Button leftIcon={<FaPlus />} size="sm" variant="outline"> Query</Button>
            </Flex>
            
            <VStack alignItems="left">
                {}
            </VStack>
        </Box>
    </>)
}

export default EditPanelQuery