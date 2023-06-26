// Render series table in tooltip

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { formatUnit } from "components/unit"
import { last, reverse, round, sortBy } from "lodash"
import { useState } from "react"
import { ActiveSeriesEvent } from "src/data/bus-events"
import { PanelProps } from "types/dashboard"
import { SeriesData } from "types/plugins/graph"
import useBus from "use-bus"

interface Props {
    props: PanelProps
    data: SeriesData[]
    nearestSeries?: SeriesData
    filterIdx?: number
    filterType: seriesFilterType // controls which value should be seen in series table
    placement?: "bottom" | "right"
    onSelect?: any
}

export enum seriesFilterType {
    Nearest = "nearest",
    Current = "current",
}

const SeriesTable = ({ props, data, nearestSeries, filterIdx, filterType, onSelect }: Props) => {
    const [activeSeries, setActiveSeries] = useState(null)
    useBus(
        (e) => { return e.type == ActiveSeriesEvent && e.id == props.panel.id },
        (e) => {
            setActiveSeries(e.data)
        }
    )

    const res = []

    switch (filterType) {
        case seriesFilterType.Nearest: // tooltip
                res.push({ name: nearestSeries.name, color: nearestSeries.color, value: nearestSeries.fields[1].values[filterIdx] })
            break
        case seriesFilterType.Current: // legend
            for (const d of data) {
                res.push({ name: d.name, value: last(d.fields[1].values), color: d.color })
            }
            break
        default:
    }


    let res1 = reverse(sortBy(res, 'value'))

    for (const r of res1) {
        r.value = props.panel.plugins.stat.value.unitsType != "none"
            ? formatUnit(r.value, props.panel.plugins.stat.value.units, props.panel.plugins.stat.value.decimal)
            : round(r.value, props.panel.plugins.stat.value.decimal)
    }

    const values = res1



    console.log("here3333 filter:",filterIdx)
    return (
        <Box fontSize="xs" minWidth="fit-content">
            {/* {filterType != seriesFilterType.Nearest && <Flex justifyContent="space-between">
                <Box></Box>
                <Text>current</Text>
            </Flex>} */}
            <VStack alignItems="left" spacing="1" mt="2px">
                {values.map((v,i) => {
                    if (filterType == seriesFilterType.Nearest && (activeSeries && activeSeries != v.name)) {
                        // hiding inactive tooltips
                        return <></>
                    }
                    return <Flex justifyContent="space-between" opacity={(activeSeries && activeSeries != v.name) ? '0.6' : (v.name == nearestSeries?.name ? 1 : 1)} fontWeight={v.name == nearestSeries?.name ? 'bold' : "inherit"} cursor="pointer" onClick={() => onSelect(v.name,i)}>
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