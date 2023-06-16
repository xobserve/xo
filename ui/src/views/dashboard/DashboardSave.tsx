import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, StackDivider, Tag, Text, Tooltip, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import { useLeavePageConfirm } from "hooks/useLeavePage"
import { isEqual } from "lodash"
import { useEffect, useState } from "react"
import { FaRegSave } from "react-icons/fa"
import { Dashboard } from "types/dashboard"
import useKeyboardJs from 'react-use/lib/useKeyboardJs';
import { requestApi } from "utils/axios/request"
import moment from "moment"
import { dispatch } from "use-bus"
import { FullscreenEvent, PreviewDashboardEvent, StopPreviewDashboardEvent } from "src/data/bus-events"

interface Props {
    dashboard: Dashboard
}
const DashboardSave = ({ dashboard }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isSaveOpen, onOpen: onSaveOpen, onClose: onSaveClose } = useDisclosure()
    const [saved, setSaved] = useState(null)
    const [pageChanged, setPageChanged] = useState(false)
    const [inPreview, setInPreview] = useState(false)

    const [pressed] = useKeyboardJs("ctrl+s")

    useEffect(() => {
        if (pressed && !isOpen) {
            onSaveOpen()
        }

    }, [pressed])

    useLeavePageConfirm(pageChanged)

    useEffect(() => {
        if (!saved && dashboard)  {
            setSaved(dashboard)
            return
        }


        const changed = JSON.stringify(dashboard) !=  JSON.stringify(saved)
        if (changed) {
            setSaved(dashboard)
            setPageChanged(true)
        } else {
            setPageChanged(false)
        }
    }, [dashboard])



    const toast = useToast()
    const onSave = async () => {
        await requestApi.post("/dashboard/save", dashboard)
        toast({
            title: "Dashboard saved.",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        setSaved(dashboard)
        setPageChanged(false)
    }

    const onViewHistory = () => {
        if (!inPreview && pageChanged) {
            toast({
                title: "Current dashboard has changes, please save it before viewing history.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        onOpen()
    }
    const onPreview = (v) => {
        setInPreview(v)
    }
    return (
        <>
            <Box>
                <Menu>
                    <MenuButton as={IconButton} variant="ghost" sx={{
                        span: {
                            display: "flex",
                            justifyContent: "center",
                        }
                    }}>
                        <FaRegSave />
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={onSaveOpen}>Save</MenuItem>
                        <MenuItem onClick={onViewHistory}>View history</MenuItem>
                    </MenuList>
                </Menu>
            </Box>
            <Drawer
                key={dashboard.id}
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Dashboard revision history</DrawerHeader>

                    <DrawerBody>
                        <DashboardHistory dashboard={dashboard} onPreview={onPreview} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Modal isOpen={isSaveOpen} onClose={onSaveClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Save dashboard</ModalHeader>
                    <ModalBody>
                        {inPreview && <Alert status='error' flexDirection="column">
                            <AlertIcon />
                            <AlertTitle>Dangerous</AlertTitle>
                            <AlertDescription fontWeight="bold" mt="1">You are previewing a history now, do you want to override current dashboard?</AlertDescription>
                        </Alert>}
                    </ModalBody>

                    <ModalFooter>
                        <Button  mr={3} onClick={onSaveClose}>
                            Close
                        </Button>
                        <Button variant='ghost' onClick={onSave} >Submit</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default DashboardSave

interface HistoryProps {
    dashboard: Dashboard
    onPreview: any
}

const DashboardHistory = ({ dashboard, onPreview }: HistoryProps) => {
    const [history, setHistory] = useState([])

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get(`/dashboard/history/${dashboard.id}`)
        setHistory(res.data)
    }

    return (
        <VStack alignItems="left" divider={<StackDivider />}>
            {
                history.map((dash: Dashboard, i) => <Flex alignItems="center" justifyContent="space-between">
                    <HStack>
                        <Text fontSize="0.9rem">{moment(dash.updated).format("MM-DD HH:mm:ss")}</Text>
                        {i == 0 && <Tooltip label="click here to continue use current dashboard, and stop previewing"><Tag cursor="pointer" onClick={() => {
                            // sent two events to ensure the raw dashhboard has no changes, it's weird, but hard to fix
                             dispatch({ type: PreviewDashboardEvent, data: dash });
                             setTimeout(() => {
                                dispatch({ type: PreviewDashboardEvent, data: dash });
                             },5000)
                           
                             onPreview(false)
                        }}>Current</Tag></Tooltip>}
                    </HStack>
                    {i != 0 && <HStack>
                        <Button size="xs" variant={dashboard.updated == dash.updated ? "solid" : "outline"} onClick={() => {
                            dispatch({ type: PreviewDashboardEvent, data: dash });
                            onPreview(true)
                        }}>Preview</Button>
                    </HStack>}
                </Flex>)
            }
        </VStack>
    )
}
