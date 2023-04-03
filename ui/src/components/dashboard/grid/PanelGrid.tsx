import { DatasourceType, Panel, PanelType } from "types/dashboard"
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, Center, HStack, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { IoMdInformation } from "react-icons/io";
import TextPanel from "../plugins/panel/text/Text";
import { useEffect, useState } from "react";
import { run_prometheus_query } from "../plugins/datasource/prometheus/query_runner";
import { DataFrame } from "types/dataFrame";
import GraphPanel from "../plugins/panel/graph/Graph";
import { PANEL_BODY_PADDING, PANEL_HEADER_HEIGHT } from "src/data/constants";
import { isEmpty } from "lodash";
import { TimeRange } from "types/time";
import useVariables from "hooks/use-variables";
import { Variable } from "types/variable";

interface PanelGridProps {
    panel: Panel
    onEditPanel?: any
    onRemovePanel?: any
    timeRange: TimeRange
    variables: Variable[]
}

const PanelGrid = (props: PanelGridProps) => {
    return (<AutoSizer>
        {({ width, height }) => {
            if (width === 0) {
                return null;
            }


            return (
                <Box width={width}
                    height={height}>
                    <PanelComponent width={width} height={height} {...props} />
                </Box>
            );
        }}
    </AutoSizer>)
}

export default PanelGrid

interface PanelComponentProps extends  PanelGridProps {
    width: number
    height: number
}

export const PanelComponent = ({ panel, onEditPanel, onRemovePanel,width,height,timeRange,variables }: PanelComponentProps) => {
    const CustomPanelRender = (props) => {
        //@needs-update-when-add-new-panel
        switch (panel?.type) {
            case PanelType.Text:
                return <TextPanel panel={panel} {...props}/>
            case PanelType.Graph:
                return <GraphPanel panel={panel} {...props} />
            default:
                return <></>
        }
    }

    const [panelData, setPanelData] = useState<DataFrame[]>([])
    const [queryError, setQueryError] = useState()
    
    // run the queries and render the panel
    useEffect(() => {
        console.log("panel changed! query data!")
        let h;
        if (h) {
            clearInterval(h)
        }

        // if there is no data in panel currently, we should make a immediate query
        // if (isEmpty(panelData)) {
            queryData()
        // }

        // h = setInterval(() => {
        //     queryData()
        // }, 10000)

        return () => clearInterval(h)
    }, [panel.datasource,timeRange])

    const queryData = async () => {
        console.log("query data:",timeRange)
        for (const ds of panel.datasource) {
            if (ds.selected) {
                let data = []
                for (const q of ds.queries) {
                    let res
                    switch (ds.type) {
                        case DatasourceType.Prometheus:
                            res = await run_prometheus_query(q,timeRange)
                            break;       
                        default:
                            break;
                    }

                    if (res.error) {
                        setQueryError(res.error)
                    } else {
                        setQueryError(null)
                    }

                    if (!isEmpty(res.data)) {
                        data.push(...res.data)
                    }
                } 
               
                console.log("query result: ", data)
                setPanelData(data)
            }
        }
    }

    const panelBodyHeight = height - PANEL_HEADER_HEIGHT
    const panelInnerHeight = panelBodyHeight - PANEL_BODY_PADDING * 2 // 10px padding top and bottom of panel body
    const panelInnerWidth = width + 8 // 10px padding left and right of panel body
    return <Box height="100%" >
        <HStack className="grid-drag-handle" height={`${PANEL_HEADER_HEIGHT}px`} cursor="move" spacing="0">
            {(queryError || panel.desc) && <Box color={useColorModeValue(queryError ? "red" :"brand.500", queryError ? "red" :"brand.200")} position="absolute">
                <Tooltip label={queryError ?? panel.desc}>
                    <Box>
                        <IoMdInformation fontSize="20px" cursor="pointer" />
                    </Box>
                </Tooltip>
            </Box>}
            <Center width="100%">
                {onEditPanel ? <Menu placement="bottom">
                    <MenuButton
                        transition='all 0.2s'
                        _focus={{ border: null }}
                    >
                        <Text cursor="pointer" width="fit-content">{panel.title}</Text>
                    </MenuButton>
                    <MenuList p="1">
                        <MenuItem icon={<FaEdit />} onClick={() => onEditPanel(panel)}>Edit</MenuItem>
                        <MenuDivider my="1" />
                        <MenuItem icon={<FaTrashAlt />} onClick={() => onRemovePanel(panel)}>Remove</MenuItem>
                    </MenuList>
                </Menu> :
                    <Text cursor="pointer" width="fit-content">{panel.title}</Text>
                }
            </Center>
        </HStack>
        <Box
            // panel={panel}
            maxHeight={`${panelBodyHeight}px`}
            overflowY="scroll"
            marginLeft={panel.type == PanelType.Graph ? "-10px" : "0px"}
            h="100%"
        >
            <CustomPanelRender data={panelData} height={panelInnerHeight} width={panelInnerWidth} variables={variables} />
        </Box>
    </Box>
}

