import { Box, Flex, HStack, Modal, ModalBody, ModalContent, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Tooltip, useColorModeValue, useDisclosure, useToast } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import { PanelAdd } from "components/icons/PanelAdd"
import TimePicker from "components/TimePicker"
import { useRouter } from "next/router"
import { FaCog, FaRegClock, FaRegSave } from "react-icons/fa"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"

interface HeaderProps {
    dashboard: Dashboard
    team: Team
    onAddPanel: any
    onTimeChange: any
}
const DashboardHeader = ({ dashboard, team, onAddPanel,onTimeChange }: HeaderProps) => {
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
        <>
        <Flex justifyContent="space-between" py="2" width="calc(100% - 100px)" position="fixed" bg={'var(--chakra-colors-chakra-body-bg)'}>
            <HStack textStyle="subTitle">
                <Tooltip label="the team which current dashboard belongs to"><Box cursor="pointer" onClick={() => router.push(`${ReserveUrls.Config}/team/${team.id}/members`)}>{team?.name}</Box></Tooltip>
                <Box>/</Box>
                <Box>{dashboard.title}</Box>
            </HStack>
            <HStack>
                <HStack spacing="1">
                    <IconButton onClick={onAddPanel}><PanelAdd size={28} fill={useColorModeValue("var(--chakra-colors-brand-500)", "var(--chakra-colors-brand-200)")} /></IconButton>
                    <IconButton onClick={onSave}><FaRegSave /></IconButton>
                    <IconButton><FaCog /></IconButton>
                    <IconButton onClick={onOpen}><FaRegClock /></IconButton>
                </HStack>

            </HStack>
        </Flex>
         <Modal isOpen={isOpen} onClose={onClose}>
         <ModalOverlay />
         <ModalContent minW="fit-content">
           <ModalBody>
           <TimePicker onClose={onClose}  onTimeChange={onTimeChange} />
           </ModalBody>

         </ModalContent>
       </Modal>
       </>
    )
}

export default DashboardHeader