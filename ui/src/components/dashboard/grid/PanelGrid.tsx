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

interface PanelGridProps {
    panel: Panel
    onEditPanel: any
    onRemovePanel: any
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

interface PanelComponentProps {
    panel: Panel
    onEditPanel?: any
    onRemovePanel?: any
    width: number
    height: number
}

export const PanelComponent = ({ panel, onEditPanel, onRemovePanel,width,height }: PanelComponentProps) => {

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
    // run the queries and render the panel
    useEffect(() => {
        let h;
        if (h) {
            clearInterval(h)
        }

        // if there is no data in panel currently, we should make a immediate query
        if (isEmpty(panelData)) {
            queryData()
        }

        // h = setInterval(() => {
        //     queryData()
        // }, 10000)

        return () => clearInterval(h)
    }, [panel])

    const queryData = () => {
        for (const ds of panel.datasource) {
            if (ds.selected) {
                let data;
                switch (ds.type) {
                    case DatasourceType.Prometheus:
                        data = run_prometheus_query(ds.queries)
                        break;

                    default:
                        break;
                }

                setPanelData(data)
            }
        }
    }

    const panelBodyHeight = height - PANEL_HEADER_HEIGHT
    const panelInnerHeight = panelBodyHeight - PANEL_BODY_PADDING * 2 // 10px padding top and bottom of panel body
    const panelInnerWidth = width + 8 // 10px padding left and right of panel body
    return <Box height="100%" >
        <HStack className="grid-drag-handle" height={`${PANEL_HEADER_HEIGHT}px`} cursor="move" spacing="0">
            {panel.desc && <Box color={useColorModeValue("brand.500", "brand.200")} position="absolute">
                <Tooltip label={panel.desc}>
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
        >
            <CustomPanelRender data={panelData} height={panelInnerHeight} width={panelInnerWidth} />
        </Box>
    </Box>
}

