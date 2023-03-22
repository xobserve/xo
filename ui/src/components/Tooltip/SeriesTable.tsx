// Render series table in tooltip

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { last, reverse, round, sortBy } from "lodash"
import { useEffect, useState } from "react"
import { PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"

interface Props {
    props: PanelProps
    nearestSeries?: DataFrame
    filterIdx?: number
    filterType: seriesFilterType // controls which value should be seen in series table
    placement?: "bottom" | "right"
    onSelect?: any
}

export enum seriesFilterType {
    Nearest = "nearest",
    Current = "current",
}

const SeriesTable = ({ props, nearestSeries, filterIdx, filterType,onSelect }: Props) => {
    const [values, setValues] = useState([])
    useEffect(() => {
        const res = []
        for (const d of props.data) {
            switch (filterType) {
                case seriesFilterType.Nearest:
                    res.push({name: d.name,value: round(d.fields[1].values[filterIdx], 2) ,color: d.color})
                    break
                case seriesFilterType.Current:
                    res.push({name: d.name,value:  round(last(d.fields[1].values), 2),color: d.color })
                    break
                default:
            }
        }
        let res1 = reverse(sortBy(res,'value'))
        setValues(res1)
    },[props,nearestSeries,filterIdx])


    return (
        <Box fontSize="xs" minWidth="fit-content">
            {filterType != seriesFilterType.Nearest && <Flex justifyContent="space-between">
                <Box></Box>
                <Text>current</Text>
            </Flex>}
            <VStack alignItems="left" spacing="1" mt="2px">
                {values.map(v => {
                    if (filterType == seriesFilterType.Nearest && ( props.panel.settings.activeSeries && props.panel.settings.activeSeries != v.name)) {
                        // hiding inactive tooltips
                        return <></>
                    }
                    return <Flex justifyContent="space-between" opacity={ (props.panel.settings.activeSeries && props.panel.settings.activeSeries != v.name) ? '0.6': (v.name == nearestSeries?.name ? 1 : 1)} fontWeight={v.name == nearestSeries?.name ? 'bold' : "inherit"} cursor="pointer" onClick={() => onSelect(v.name)}>
                        <HStack alignItems="center" overflow="scroll">
                            <Box width="10px" height="4px" background={v.color} mt="2px"></Box>
                            <Text>{v.name}</Text>
                        </HStack>
                        <Text ml="3" minWidth="30px">{v.value}</Text>
                    </Flex>
                })}
            </VStack>
        </Box>)
}

export default SeriesTable