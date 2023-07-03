// Render series table in tooltip

import { Box, Flex, HStack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react"
import { formatUnit } from "components/unit"
import { cloneDeep, orderBy, round } from "lodash"
import { memo } from "react"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"
import { useKeyPress } from "react-use"
import { UpdatePanelEvent } from "src/data/bus-events"
import { PanelProps, PanelType } from "types/dashboard"
import { ValueSetting } from "types/panel/plugins"
import { SeriesData } from "types/seriesData"
import { dispatch } from "use-bus"

import { calcValueOnArray } from "utils/seriesData"

interface Props {
    props: PanelProps
    data: SeriesData[]
    nearestSeries?: SeriesData
    filterIdx?: number
    mode: seriesTableMode // controls which value should be seen in series table
    placement?: "bottom" | "right"
    onSelect?: any
    panelType: PanelType
    width?: number
    inactiveSeries?: string[]
}

export enum seriesTableMode {
    Tooltip = "tooltip",
    Legend = "legend",
}

const SeriesTable = memo(({ props, data, nearestSeries, filterIdx, mode, onSelect, panelType, width, inactiveSeries }: Props) => {
    let pressShift = null
    if (mode == seriesTableMode.Legend) {
        pressShift = useKeyPress((event) =>{
            if (event.key === 'Shift') {
                event.stopPropagation()
                event.preventDefault()
                return true
            }
            return false
        })
    }

    const tooltipMode = panelType == PanelType.Graph ? props.panel.plugins.graph.tooltip.mode : "single"
    const valueSettings: ValueSetting = props.panel.plugins[panelType].value
    const tooltipSort = panelType == PanelType.Graph ? props.panel.plugins.graph.tooltip.sort : "desc"
    const res = []

    switch (mode) {
        case seriesTableMode.Tooltip: // tooltip
            if (tooltipMode != "single") {
                for (const d of data) {
                    res.push({ name: d.name, value: [["", d.fields[1].values[filterIdx]]], color: d.color })
                }
            } else {
                res.push({ name: nearestSeries.name, color: nearestSeries.color, value: [["", nearestSeries.fields[1].values[filterIdx]]] })
            }
            break
        case seriesTableMode.Legend: // legend
            for (const d of data) {
                let v = []
                for (const calc of props.panel.plugins.graph.legend.valueCalcs) {
                    v.push([calc, calcValueOnArray(d.fields[1].values, calc)])
                }
                res.push({ name: d.name, value: v, color: d.color })
            }
            break
        default:
    }

    let values;
    if (mode == seriesTableMode.Tooltip) {
        values = orderBy(res, i => {
            const v = i.value[0][1]
            return v == null ? 0 : v
        }, tooltipSort)
    } else {
        values = orderBy(res, i => {
            for (const v of i.value) {
                if (v[0] == props.panel.plugins.graph.legend.order?.by) {
                    return v[1] == null ? 0 : v[1]
                }
            }
        }, props.panel.plugins.graph.legend.order?.sort)
    }





    return (
        <Box fontSize="xs" width="100%">
            <TableContainer maxW={props.panel.plugins.graph?.legend.placement == "bottom" ? props.width - 20 : width} p={0} marginLeft="-18px" sx={{
                '::-webkit-scrollbar': {
                    width: '1px',
                    height: '1px',
                }
            }}>
                <Table variant='unstyled' size="sm" p="0">
                    <Thead>
                        <Tr>
                            <Th> </Th>
                            {values[0].value.map(v => <Td fontSize="0.8remt" pt="0" pb="1" pr="1" pl="0" textAlign="center" fontWeight="500" onClick={() => {
                                props.panel.plugins.graph.legend.order = { by: v[0], sort: props.panel.plugins.graph?.legend.order.sort == "asc" ? "desc" : "asc" }
                                dispatch({
                                    type: UpdatePanelEvent,
                                    data: cloneDeep(props.panel)
                                })
                            }}><HStack spacing={0} justifyContent="center" cursor="pointer"><Text>{v[0]}</Text><Text> {props.panel.plugins.graph?.legend.order.by == v[0] && <Text fontSize="0.6rem" opacity="0.7" position="absolute" top="3.5px">{props.panel.plugins.graph.legend.order.sort == "asc" ? <FaChevronUp /> :<FaChevronDown />}</Text>}</Text></HStack></Td>)}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {values.map((v, i) => {
                            if ((mode == seriesTableMode.Tooltip) && inactiveSeries.includes(v.name)) {
                                // hiding inactive tooltips
                                return <></>
                            }
                            return (
                                <Tr verticalAlign="top">
                                    <Td fontSize="0.75rem" py="1" cursor="pointer" onClick={mode == seriesTableMode.Legend ? () => onSelect(v.name, i, pressShift[0]): null}>
                                        <HStack alignItems="center" opacity={(inactiveSeries.includes(v.name)) ? '0.6' : (v.name == nearestSeries?.name ? 1 : 1)} fontWeight={v.name == nearestSeries?.name ? 'bold' : "inherit"}  userSelect="none">
                                            <Box width="10px" height="4px" background={v.color} mt="2px"></Box>
                                            {
                                                (props.panel.plugins.graph?.legend.placement == "bottom" || mode == seriesTableMode.Tooltip) ?
                                                    <Text maxW={"auto"} noOfLines={3} wordBreak="break-all" whiteSpace={"break-spaces"}>{v.name}</Text>
                                                    :
                                                    <Text w={props.panel.plugins.graph?.legend.nameWidth === "full" ? "100%" : props.panel.plugins.graph?.legend.nameWidth + 'px'} noOfLines={3} wordBreak="break-all" whiteSpace={props.panel.plugins.graph?.legend.nameWidth === "full" ? "nowrap" : "break-spaces"}>{v.name}</Text>
                                            }

                                        </HStack>
                                    </Td>
                                    {v.value.map((v, i) => <Td textAlign="center" fontSize="0.75rem" py="1" px="1">{v[1] ? valueSettings.unitsType != "none"
                                        ? formatUnit(v[1], valueSettings.units, valueSettings.decimal)
                                        : round(v[1], valueSettings.decimal) : v[1]}</Td>)}
                                </Tr>
                            )
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>)
})

export default SeriesTable

