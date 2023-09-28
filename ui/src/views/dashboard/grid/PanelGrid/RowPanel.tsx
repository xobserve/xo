import { Box, Flex, HStack, Text } from "@chakra-ui/react"
import CollapseIcon from "components/icons/Collapse"
import React from "react"
import { MdDragIndicator } from "react-icons/md"
import { Dashboard, Panel, PanelType } from "types/dashboard"

interface Props {
    dashboard: Dashboard
    panel: Panel
    onChange: any
}

const RowPanel = (props: Props) => {
    const { panel, dashboard, onChange } = props
    const onRowClick = () => {
        onChange((dash: Dashboard) => {
            let rowFinded = false
            let oldCollapsed
            for (const p of dash.data.panels) {
      
                if (p.id == panel.id) {
                    oldCollapsed = p.collapsed
                    p.collapsed = !oldCollapsed
                    rowFinded = true
                    continue
                }
                
                if (rowFinded) {
                    if (p.type == PanelType.Row) {
                        break
                    } else {
                        p.collapsed = !oldCollapsed
                    }
                }
            }
        })
    }
    return (<Flex className={"hover-bg"} alignItems="center" justifyContent="space-between" width="100%" >
        <HStack cursor={"pointer"} onClick={onRowClick} width="100%">
            <CollapseIcon collapsed={panel.collapsed} fontSize="0.6rem" />
            <Text fontSize="0.9rem"> {panel.title}</Text>
        </HStack>

        <MdDragIndicator cursor="move" className="grid-drag-handle"/>
    </Flex>)
}

export default RowPanel