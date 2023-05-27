import { Box, Button, Flex, HStack, Modal, ModalBody, ModalContent, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Select, Tooltip, useColorModeValue, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import { PanelAdd } from "components/icons/PanelAdd"
import TimePicker, { getInitTimeRange, TimePickerKey } from "components/TimePicker"
import SelectVariables from "components/variables/SelectVariables"
import { subMinutes } from "date-fns"
import { find, isEmpty } from "lodash"
import { useRouter } from "next/router"
import { variables } from "pages/[...dashboardId]"
import { memo, useEffect, useState } from "react"
import { FaRegClock, FaRegSave } from "react-icons/fa"
import { MdSync } from "react-icons/md"
import { VariableChangedEvent } from "src/data/bus-events"
import { StorageCopiedPanelKey } from "src/data/constants"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"
import { TimeRange } from "types/time"
import { Variable } from "types/variable"
import useBus from "use-bus"
import { requestApi } from "utils/axios/request"
import storage from "utils/localStorage"
import DashboardSettings from "./settings/DashboardSettings"

interface HeaderProps {
    dashboard: Dashboard
    team: Team
    onAddPanel: any
    onTimeChange: any
    timeRange: TimeRange
    onVariablesChange: any
    onChange: any
    onDashboardSave: any
    onPastePanel: any
}
const DashboardHeader = memo(({ dashboard, team, onAddPanel, onTimeChange, timeRange, onVariablesChange, onChange, onDashboardSave, onPastePanel }: HeaderProps) => {
    const toast = useToast()
    const router = useRouter()
    const [variablesChanged, setVariablesChanged] = useState(0)
    const [refresh, setRefresh] = useState(0)
    let refreshH;
    const onSave = async () => {
        await requestApi.post("/dashboard/save", dashboard)
        toast({
            title: "Dashboard saved.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        onDashboardSave()
    }

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    useEffect(() => {
        if (refresh > 0) {
            refreshH = setInterval(() => {
                const tr = getInitTimeRange()
                console.log(tr)
                if (tr.sub > 0) {
                    const now = new Date()
                    tr.start = subMinutes(now, tr.sub)
                    tr.end = now
                    storage.set(TimePickerKey, JSON.stringify(tr))
                    onTimeChange(tr)

                }
            }, 1000 * refresh)
        } else {
            clearInterval(refreshH)
        }

        return () => {
            clearInterval(refreshH)
        }
    }, [refresh])

    useBus(
        VariableChangedEvent,
        () => {
            console.log("dash header recv variable change event:",variables);
            setVariablesChanged(variablesChanged + 1)
        },
        [variablesChanged]
    )

    const addPanel = () => {
        const copiedPanel = storage.get(StorageCopiedPanelKey)
        if (copiedPanel) {
            onAddOpen()
            return
        }

        onAddPanel()
    };


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
                        <IconButton onClick={addPanel}><PanelAdd size={28} fill={useColorModeValue("var(--chakra-colors-brand-500)", "var(--chakra-colors-brand-200)")} /></IconButton>
                        <IconButton onClick={onSave}><FaRegSave /></IconButton>
                        {dashboard && <DashboardSettings dashboard={dashboard} onChange={onChange} />}
                        <Tooltip label={`${timeRange?.start.toLocaleString()} - ${timeRange?.end.toLocaleString()}`}><Box><IconButton onClick={onOpen}><FaRegClock /></IconButton></Box></Tooltip>
                        <HStack spacing={0}>
                            <Tooltip label="refresh dashboard"><Box><IconButton><MdSync /></IconButton></Box></Tooltip>
                            <Select value={refresh} onChange={(e) => setRefresh(Number(e.target.value))}>
                                <option value={0}>OFF</option>
                                <option value={5}>5s</option>
                                <option value={10}>10s</option>
                                <option value={30}>30s</option>
                                <option value={60}>1m</option>
                            </Select>

                        </HStack>


                    </HStack>

                </HStack>

            </Flex>
            {!isEmpty(variables) && <Flex justifyContent="space-between" mt="1">
                <SelectVariables id={variablesChanged}  variables={variables.filter((v) => v.id.toString().startsWith("d-"))} />
                <SelectVariables  id={variablesChanged} variables={variables.filter((v) => !v.id.toString().startsWith("d-") && !find(dashboard.data.hidingVars?.split(','), v1 => v1 == v.name))} />
            </Flex>}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent minW="fit-content">
                    <ModalBody>
                        <TimePicker onClose={onClose} onTimeChange={onTimeChange} />
                    </ModalBody>

                </ModalContent>
            </Modal>

            <Modal isOpen={isAddOpen} onClose={onAddClose} >
                <ModalOverlay />
                <ModalContent mt="20%">
                    <ModalBody py="10">
                        <VStack>
                            <Button onClick={() => { onAddPanel(); onAddClose() }}>Add new panel</Button>
                            <Button onClick={() => { onPastePanel(); onAddClose() }}>Paste panel from clipboard</Button>
                        </VStack>

                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    )
})

export default DashboardHeader