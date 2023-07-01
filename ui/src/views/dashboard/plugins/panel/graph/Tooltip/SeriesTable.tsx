// Render series table in tooltip

import { Box, Flex, HStack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react"
import { formatUnit } from "components/unit"
import { last, orderBy, reverse, round, sortBy } from "lodash"
import { useMemo, useState } from "react"
import { ActiveSeriesEvent } from "src/data/bus-events"
import { PanelProps, PanelType } from "types/dashboard"
import { ValueSetting } from "types/panel/plugins"
import { SeriesData } from "types/seriesData"

import useBus from "use-bus"

interface Props {
    props: PanelProps
    data: SeriesData[]
    nearestSeries?: SeriesData
    filterIdx?: number
    filterType: seriesFilterType // controls which value should be seen in series table
    placement?: "bottom" | "right"
    onSelect?: any
    panelType: PanelType
    width?: number
}

export enum seriesFilterType {
    Nearest = "nearest",
    Current = "current",
}

const SeriesTable = ({ props, data, nearestSeries, filterIdx, filterType, onSelect, panelType,width }: Props) => {
    const tooltipMode = panelType == PanelType.Graph ? props.panel.plugins.graph.tooltip.mode : "single"
    const valueSettings: ValueSetting = props.panel.plugins[panelType].value
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
            if (tooltipMode != "single") {
                for (const d of data) {
                    res.push({ name: d.name, value: d.fields[1].values[filterIdx], color: d.color })
                }
            } else {
                res.push({ name: nearestSeries.name, color: nearestSeries.color, value: nearestSeries.fields[1].values[filterIdx] })
            }
            break
        case seriesFilterType.Current: // legend
            for (const d of data) {
                res.push({ name: d.name, value: last(d.fields[1].values), color: d.color })
            }
            break
        default:
    }

    let res1 = orderBy(res, i => i.value == null ? 0 : i.value, 'desc')

    for (const r of res1) {
        if (r.value) {
            r.value = valueSettings.unitsType != "none"
                ? formatUnit(r.value, valueSettings.units, valueSettings.decimal)
                : round(r.value, valueSettings.decimal)
        }
    }

    const values = res1


    return (
        <Box fontSize="xs" width="100%">
            {/* //     <HStack alignItems="start">
        //         <VStack alignItems={"left"} maxW="400px" overflowX="scroll">
        //             <Box height="15px"></Box>
        //             {values.map((v, i) => {
        //                 if (filterType == seriesFilterType.Nearest && (activeSeries && activeSeries != v.name)) {
        //                     // hiding inactive tooltips
        //                     return <></>
        //                 }
        //                 return <>
        //                         <HStack alignItems="center" height="auto">
        //                             <Box width="10px" height="4px" background={v.color} mt="2px"></Box>
        //                             <Text>{v.name}</Text>
        //                         </HStack>
        //                 </>
        //             })}

        //         </VStack>
        //         <HStack>
        //             {props.panel.plugins.graph.legend.valueCalcs.map((calc, i) => <VStack alignItems="left">
        //                 <Text width="30px" lineHeight="15px">{calc}</Text>
        //                 {values.map((v, i) =>
        //                     <Text width="30px" lineHeight="18px">{v.value}</Text>
        //                 )}
        //             </VStack>)}
        //         </HStack>
        //     </HStack> */}
            <TableContainer maxW={props.panel.plugins.graph.legend.placement == "bottom" ? props.width - 20 : width} p={0} marginLeft="-18px" sx={{
                  '::-webkit-scrollbar': {
                    width: '1px',
                    height: '1px',
                  }  
            }}>
                <Table variant='unstyled' size="sm" p="0">
                    <Thead>
                        <Tr>
                            <Th> </Th>
                            {props.panel.plugins.graph.legend.valueCalcs.map((calc, i)  => <Td fontSize="0.8remt" pt="0" pb="1" pr="1" pl="0" textAlign="center">{calc}</Td>)}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {values.map((v, i) => {
                            return (
                                <Tr verticalAlign="top">
                                    <Td fontSize="0.75rem" py="1">
                                    <HStack alignItems="center" opacity={(activeSeries && activeSeries != v.name) ? '0.6' : (v.name == nearestSeries?.name ? 1 : 1)} fontWeight={v.name == nearestSeries?.name ? 'bold' : "inherit"} cursor="pointer" onClick={() => onSelect(v.name, i)}>
                                        <Box width="10px" height="4px" background={v.color} mt="2px"></Box>
                                        {
                                            props.panel.plugins.graph.legend.placement == "bottom" ?
                                                <Text maxW={ "auto" }  noOfLines={3} wordBreak="break-all" whiteSpace={"break-spaces"}>{v.name}</Text>
                                                : 
                                                <Text w={props.panel.plugins.graph.legend.nameWidth === "full" ? "100%" : props.panel.plugins.graph.legend.nameWidth+'px'}  noOfLines={3} wordBreak="break-all" whiteSpace={props.panel.plugins.graph.legend.nameWidth === "full" ? "nowrap" : "break-spaces"}>{v.name}</Text>
                                        }
                                         
                                    </HStack>
                                    </Td>
                                    {props.panel.plugins.graph.legend.valueCalcs.map((calc, i)  => <Td fontSize="0.75rem" py="1" px="1">10000s</Td>)}
                                </Tr>
                            )
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
            {/* {props.panel.plugins.graph.legend.valueCalcs.length > 0 && <Flex justifyContent="space-between">
                <Box ></Box>
                <HStack width={`${40 * props.panel.plugins.graph.legend.valueCalcs.length}px`} >
                    {props.panel.plugins.graph.legend.valueCalcs.map((calc, i) => <Text width="30px">{calc}</Text>)}
                </HStack>
            </Flex>}
            <VStack alignItems="left" spacing="1" mt="2px">
                {values.map((v, i) => {
                    if (filterType == seriesFilterType.Nearest && (activeSeries && activeSeries != v.name)) {
                        // hiding inactive tooltips
                        return <></>
                    }
                    return <>
                        <Flex justifyContent="space-between" opacity={(activeSeries && activeSeries != v.name) ? '0.6' : (v.name == nearestSeries?.name ? 1 : 1)} fontWeight={v.name == nearestSeries?.name ? 'bold' : "inherit"} cursor="pointer" onClick={() => onSelect(v.name, i)}>
                            <HStack alignItems="center" overflow="scroll" width={`calc(100% - ${40 * props.panel.plugins.graph.legend.valueCalcs.length}px)`}>
                                <Box width="10px" height="4px" background={v.color} mt="2px"></Box>
                                <Text maxW="300px">{v.name}</Text>
                            </HStack>
                            <HStack ml="2" width={`${40 * props.panel.plugins.graph.legend.valueCalcs.length}px`}>
                                {props.panel.plugins.graph.legend.valueCalcs.map((calc, i) => <Text width="30px">{v.value}</Text>)}
                            </HStack>
                        </Flex>
                    </>
                })}
            </VStack> */}
        </Box>)
}

export default SeriesTable