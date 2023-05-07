import { Box, Flex, HStack, Modal, ModalBody, ModalContent, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Select, Tooltip, useColorModeValue, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import TimePicker, { getInitTimeRange, TimePickerKey } from "components/TimePicker"
import SelectVariables from "src/views/variables/Variables"
import { subMinutes } from "date-fns"
import { find, isEmpty } from "lodash"
import { useRouter } from "next/router"

import { memo, useEffect, useRef, useState } from "react"
import { FaRegClock } from "react-icons/fa"
import { MdSync } from "react-icons/md"
import { VariableChangedEvent } from "src/data/bus-events"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"
import { TimeRange } from "types/time"
import useBus from "use-bus"
import { requestApi } from "utils/axios/request"
import storage from "utils/localStorage"
import AddPanel from "./AddPanel"
import { variables } from "./Dashboard"
import DashboardSave from "./DashboardSave"
import DashboardSettings from "./settings/DashboardSettings"

interface HeaderProps {
    dashboard: Dashboard
    onTimeChange: any
    timeRange: TimeRange
    onChange: any
}
const DashboardHeader = memo(({ dashboard, onTimeChange, timeRange, onChange }: HeaderProps) => {
    const toast = useToast()
    const router = useRouter()
    const [variablesChanged, setVariablesChanged] = useState(0)
    const [refresh, setRefresh] = useState(0)
    const [team, setTeam] = useState<Team>(null)

    useEffect(() => {
        getTeam()
    }, [])

    const getTeam = async () => {
        const res1 = await requestApi.get(`/team/${dashboard.ownedBy}`)
        setTeam(res1.data)
    }

    const refreshH = useRef(null)

    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        if (refresh > 0) {
            refreshH.current = setInterval(() => {
                refreshOnce()
            }, 1000 * refresh)
        } else {
            clearInterval(refreshH.current)
        }

        return () => {
            clearInterval(refreshH.current)
        }
    }, [refresh])

    const refreshOnce = () => {
        const tr = getInitTimeRange()
        if (tr.sub > 0) {
            const now = new Date()
            tr.start = subMinutes(now, tr.sub)
            tr.end = now
            storage.set(TimePickerKey, JSON.stringify(tr))
            onTimeChange(tr)
        }
    }
    useBus(
        VariableChangedEvent,
        () => {
            console.log("dash header recv variable change event:", variables);
            setVariablesChanged(variablesChanged + 1)
        },
        [variablesChanged]
    )

    return (
        <Box py="2" width="calc(100% - 90px)" position="fixed" bg={'var(--chakra-colors-chakra-body-bg)'}>
            {team &&
                <>
                    <Flex justifyContent="space-between" >
                        <HStack textStyle="subTitle">
                            <Tooltip label="the team which current dashboard belongs to"><Box cursor="pointer" onClick={() => router.push(`${ReserveUrls.Config}/team/${team.id}/members`)}>{team?.name}</Box></Tooltip>
                            <Box>/</Box>
                            <Box>{dashboard.title}</Box>
                        </HStack>

                        <HStack>
                            <HStack spacing="1">
                                <AddPanel dashboard={dashboard} onChange={onChange} />
                                <DashboardSave dashboard={dashboard} />
                                {dashboard && <DashboardSettings dashboard={dashboard} onChange={onChange} />}
                                <Tooltip label={`${timeRange?.start.toLocaleString()} - ${timeRange?.end.toLocaleString()}`}><Box><IconButton onClick={onOpen}><FaRegClock /></IconButton></Box></Tooltip>
                                <HStack spacing={0}>
                                    <Tooltip label="refresh just once"><Box onClick={refreshOnce}><IconButton><MdSync /></IconButton></Box></Tooltip>
                                    <Tooltip label="refresh with interval"><Select value={refresh} onChange={(e) => setRefresh(Number(e.target.value))}>
                                        <option value={0}>OFF</option>
                                        <option value={5}>5s</option>
                                        <option value={10}>10s</option>
                                        <option value={30}>30s</option>
                                        <option value={60}>1m</option>
                                    </Select></Tooltip>

                                </HStack>


                            </HStack>

                        </HStack>

                    </Flex>
                    {!isEmpty(variables) && <Flex justifyContent="space-between" mt="1">
                        <SelectVariables id={variablesChanged} variables={variables.filter((v) => v.id.toString().startsWith("d-"))} />
                        <SelectVariables id={variablesChanged} variables={variables.filter((v) => !v.id.toString().startsWith("d-") && !find(dashboard.data.hidingVars?.split(','), v1 => v1 == v.name))} />
                    </Flex>}
                </>}
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
})

export default DashboardHeader