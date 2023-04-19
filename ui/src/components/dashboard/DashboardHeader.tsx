import { Box, Flex, HStack, Modal, ModalBody, ModalContent, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Tooltip, useColorModeValue, useDisclosure, useToast } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import { PanelAdd } from "components/icons/PanelAdd"
import TimePicker from "components/TimePicker"
import SelectVariables from "components/variables/SelectVariables"
import { isEmpty } from "lodash"
import { useRouter } from "next/router"
import { useState } from "react"
import { FaCog, FaRegClock, FaRegSave } from "react-icons/fa"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"
import { TimeRange } from "types/time"
import { Variable } from "types/variable"
import { requestApi } from "utils/axios/request"
import DashboardSettings from "./settings/DashboardSettings"

interface HeaderProps {
    dashboard: Dashboard
    team: Team
    onAddPanel: any
    onTimeChange: any
    timeRange: TimeRange
    variables: Variable[]
    onVariablesChange: any
    onChange: any
}
const DashboardHeader = ({ dashboard, team, onAddPanel, onTimeChange, timeRange,variables,onVariablesChange,onChange }: HeaderProps) => {
    const toast = useToast()
    const router = useRouter()

    const onSave = async () => {
        const res = await requestApi.post("/dashboard/save", dashboard)
        toast({
            title: "Dashboard saved.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <Box py="2" width="calc(100% - 100px)" position="fixed" bg={'var(--chakra-colors-chakra-body-bg)'}>
            <Flex justifyContent="space-between" >
                    <HStack textStyle="subTitle">
                        <Tooltip label="the team which current dashboard belongs to"><Box cursor="pointer" onClick={() => router.push(`${ReserveUrls.Config}/team/${team.id}/members`)}>{team?.name}</Box></Tooltip>
                        <Box>/</Box>
                        <Box>{dashboard.title}</Box>
                    </HStack>

                    <HStack>
                        <HStack spacing="1">
                            <IconButton onClick={onAddPanel}><PanelAdd size={28} fill={useColorModeValue("var(--chakra-colors-brand-500)", "var(--chakra-colors-brand-200)")} /></IconButton>
                            <IconButton onClick={onSave}><FaRegSave /></IconButton>
                            <DashboardSettings dashboard={dashboard} onChange={onChange} />
                            <Tooltip label={`${timeRange?.start.toLocaleString()} - ${timeRange?.end.toLocaleString()}`}><Box><IconButton onClick={onOpen}><FaRegClock /></IconButton></Box></Tooltip>
                        </HStack>

                    </HStack>
                   
            </Flex>
            {!isEmpty(variables) && <Flex justifyContent="space-between" mt="1">
                <SelectVariables variables={variables.filter((v) => v.id.toString().startsWith("d-"))} onChange={onVariablesChange} />
                <SelectVariables variables={variables.filter((v) => !v.id.toString().startsWith("d-"))} onChange={onVariablesChange} />
                </Flex>}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent minW="fit-content">
                    <ModalBody>
                        <TimePicker onClose={onClose} onTimeChange={onTimeChange} />
                    </ModalBody>

                </ModalContent>
            </Modal>
            
        </Box>
    )
}

export default DashboardHeader