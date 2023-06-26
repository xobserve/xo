// Render series table in tooltip

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { formatUnit } from "components/unit"
import { last, reverse, round, sortBy } from "lodash"
import { useMemo, useState } from "react"
import { ActiveSeriesEvent } from "src/data/bus-events"
import { PanelProps } from "types/dashboard"
import { GraphPluginData, GraphSeries } from "types/plugins/graph"
import useBus from "use-bus"

interface Props {
    props: PanelProps
    data: GraphPluginData
}

export enum seriesFilterType {
    Nearest = "nearest",
    Current = "current",
}

const SeriesTable = ({ props, data }: Props) => {
    const [activeSeries, setActiveSeries] = useState(null)
    useBus(
        (e) => { return e.type == ActiveSeriesEvent && e.id == props.panel.id },
        (e) => {
            setActiveSeries(e.data)
        }
    )

    const res = []

    for (const d of data) {
        res.push({ name: d.name, value: last(d.fields[1].values), color: d.color })
    }

    for (const r of res) {
        r.value = props.panel.plugins.stat.unitsType != "none"
            ? formatUnit(r.value, props.panel.plugins.stat.units, props.panel.plugins.stat.decimal)
            : round(r.value, props.panel.plugins.stat.decimal)
    }

    const values = res



    return (
        <Box fontSize="xs" minWidth="fit-content">
            <VStack alignItems="left" spacing="1" mt="2px">
                {values.map((v, i) => {
                    return <Flex justifyContent="space-between" fontWeight="bold"  cursor="pointer" >
                        <HStack alignItems="center" overflow="scroll">
                            <Box width="10px" height="4px" background={props.panel.plugins.stat.styles.color} mt="2px"></Box>
                            <Text>{v.name}</Text>
                        </HStack>
                        <Text ml="3" minWidth="30px">{v.value}</Text>
                    </Flex>
                })}
            </VStack>
        </Box>)
}

export default SeriesTable