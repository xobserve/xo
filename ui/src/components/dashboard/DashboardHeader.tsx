import { Box, Flex, HStack, Tooltip, useColorModeValue } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import { PanelAdd } from "components/icons/PanelAdd"
import { useRouter } from "next/router"
import { FaCog, FaRegSave } from "react-icons/fa"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"

interface HeaderProps {
    dashboard: Dashboard
    team: Team
    onAddPanel: any
}
const DashboardHeader = ({dashboard,team,onAddPanel}: HeaderProps) => {
    const router = useRouter()

    return (
        <Flex justifyContent="space-between" py="2" width="calc(100% - 100px)" position="fixed" bg={'var(--chakra-colors-chakra-body-bg)'}>
            <HStack textStyle="subTitle">
                <Tooltip label="the team which current dashboard belongs to"><Box cursor="pointer" onClick={() => router.push(`${ReserveUrls.Config}/team/${team.id}/members`)}>{team?.name}</Box></Tooltip>
                <Box>/</Box>
                <Box>{dashboard.title}</Box>
            </HStack>
            <HStack>    
                <HStack  spacing="0">
                    <IconButton onClick={onAddPanel}><PanelAdd size={28} fill={useColorModeValue("var(--chakra-colors-brand-500)","var(--chakra-colors-brand-200)")}/></IconButton>
                    <IconButton><FaRegSave /></IconButton>
                    <IconButton><FaCog /></IconButton>
                </HStack>

            </HStack>
        </Flex>
    )
}

export default DashboardHeader