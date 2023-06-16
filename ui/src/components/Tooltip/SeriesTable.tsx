// Render series table in tooltip

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { formatUnit } from "components/unit"
import { last, reverse, round, sortBy } from "lodash"
import { useState } from "react"
import { ActiveSeriesEvent } from "src/data/bus-events"
import { PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"
import useBus from "use-bus"

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

const SeriesTable = ({ props, nearestSeries, filterIdx, filterType, onSelect }: Props) => {
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
            if (props.panel.plugins.graph.tooltip.mode != "single") {
                for (const d of props.data) {
                    res.push({ name: d.name, value: d.fields[1].values[filterIdx], color: d.color })
                }
            } else {
                res.push({ name: nearestSeries.name, color: nearestSeries.color, value: nearestSeries.fields[1].values[filterIdx] })
            }
            break
        case seriesFilterType.Current: // legend
            for (const d of props.data) {
                res.push({ name: d.name, value: last(d.fields[1].values), color: d.color })
            }
            break
        default:
    }


    let res1 = reverse(sortBy(res, 'value'))

    for (const r of res1) {
        r.value = props.panel.plugins.graph.std.unitsType != "none"
            ? formatUnit(r.value, props.panel.plugins.graph.std.units, props.panel.plugins.graph.std.decimals ?? 2)
            : round(r.value, props.panel.plugins.graph.std.decimals)
    }

    const values = res1



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