import { Panel } from "types/dashboard"
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, Center, HStack, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { FaInfo } from "react-icons/fa";
import { InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { IoMdInformation } from "react-icons/io";

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
    return <Box height="100%">
        <HStack className="bordered grid-drag-handle"  height="25px" cursor="move" spacing="0">
            {panel.desc && <Box color={useColorModeValue("brand.500","brand.200")} position="absolute" left="0">
                <Tooltip label={panel.desc}>
                    <Box>
                        <IoMdInformation fontSize="20px" cursor="pointer"/>
                    </Box>
                </Tooltip>
            </Box>}
            <Center width="100%">
                {onEditPanel ? <Menu placement="bottom" size="sm">
                    <MenuButton
                        transition='all 0.2s'
                        _focus={{ border: null }}
                    >
                        <Text cursor="pointer" width="fit-content">{panel.title}</Text>
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => onEditPanel(panel)}>Edit</MenuItem>
                        <MenuDivider />
                        <MenuItem onClick={() => onRemovePanel(panel)}>Remove</MenuItem>
                    </MenuList>
                </Menu> :
                    <Text cursor="pointer" width="fit-content">{panel.title}</Text>
                }
            </Center>
        </HStack>
        <Box
            // panel={panel}
            className="bordered"
            height="calc(100% - 25px)"
        >

        </Box>
    </Box>
}

