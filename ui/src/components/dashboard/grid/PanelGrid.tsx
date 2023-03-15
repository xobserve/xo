import { Panel, PanelType } from "types/dashboard"
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, Center, HStack, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { IoMdInformation } from "react-icons/io";
import TextPanel from "../plugins/panel/text/Text";

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
                    <PanelComponent {...props} />
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
}

export const PanelComponent = ({ panel, onEditPanel, onRemovePanel }: PanelComponentProps) => {
    
    const CustomPanelRender =  () => {
        switch (panel?.type) {
            case PanelType.Text:
                return <TextPanel panel={panel} />

            default:
                return <></>
        }
    }

    return <Box height="100%" className="bordered">
        <HStack className="grid-drag-handle"  height="25px" cursor="move" spacing="0">
            {panel.desc && <Box color={useColorModeValue("brand.500","brand.200")} position="absolute">
                <Tooltip label={panel.desc}>
                    <Box>
                        <IoMdInformation fontSize="20px" cursor="pointer"/>
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
                        <MenuDivider my="1"/>
                        <MenuItem icon={<FaTrashAlt />} onClick={() => onRemovePanel(panel)}>Remove</MenuItem>
                    </MenuList>
                </Menu> :
                    <Text cursor="pointer" width="fit-content">{panel.title}</Text>
                }
            </Center>
        </HStack>
        <Box
            // panel={panel}
            maxHeight="calc(100% - 25px)"
            overflowY="scroll"
            p="2"
        >
            <CustomPanelRender />
        </Box>
    </Box>
}

