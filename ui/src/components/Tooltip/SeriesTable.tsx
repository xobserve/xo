// Render series table in tooltip

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { last, round } from "lodash"
import { DataFrame } from "types/dataFrame"

interface Props {
    data: DataFrame[]
    nearestSeries?: DataFrame
    filterIdx?: number
    filterType: seriesFilterType // controls which value should be seen in series table
    placement?: "bottom" | "right"
}

export enum seriesFilterType {
    Nearest = "nearest",
    Current = "current",
}

const SeriesTable = ({ data, nearestSeries, filterIdx, filterType }: Props) => {

    const filter = (d: DataFrame) => {
        switch (filterType) {
            case seriesFilterType.Nearest:
                return round(d.fields[1].values[filterIdx], 2)
            case seriesFilterType.Current:
                return round(last(d.fields[1].values), 2)
            default:
                return ''
        }
    }

    return (
        <Box fontSize="xs" opacity="0.9" minWidth="fit-content">
            <Flex justifyContent="space-between">
                <Box></Box>
                <Text>current</Text>
            </Flex>
            <VStack alignItems="left" spacing="1" mt="2px">
                {data.map(d => {
                    return <Flex justifyContent="space-between" opacity={d.name == nearestSeries?.name ? 1 : "inherit"} fontWeight={d.name == nearestSeries?.name ? '600' : "inherit"}>
                        <HStack alignItems="center" overflow="scroll">
                            <Box width="10px" height="4px" background={d.color} mt="2px"></Box>
                            <Text>{d.name}</Text>
                        </HStack>
                        <Text ml="3" minWidth="30px">{filter(d)}</Text>
                    </Flex>
                })}
            </VStack>
        </Box>)
}

export default SeriesTable