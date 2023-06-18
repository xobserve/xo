import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Center, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Flex, HStack, IconButton, Input, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, StackDivider, Tag, Text, Tooltip, useColorMode, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import { useLeavePageConfirm } from "hooks/useLeavePage"

import { useEffect, useState } from "react"
import { FaRegSave } from "react-icons/fa"
import { Dashboard } from "types/dashboard"
import useKeyboardJs from 'react-use/lib/useKeyboardJs';
import { requestApi } from "utils/axios/request"
import moment from "moment"
import { dispatch } from "use-bus"
import { SetDashboardEvent } from "src/data/bus-events"
import { FormItem } from "components/form/Form"
import { diffObject } from "utils/diff"
import ReactDiffViewer from 'react-diff-viewer';
import { useSearchParam } from "react-use"
import { isEqual } from "lodash"

interface Props {
    dashboard: Dashboard
}
const DashboardSave = ({ dashboard }: Props) => {
    const edit = useSearchParam('edit')
    const { colorMode } = useColorMode()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isSaveOpen, onOpen: onSaveOpen, onClose: onSaveClose } = useDisclosure()
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
    const [saved, setSaved] = useState(null)
    const [pageChanged, setPageChanged] = useState(false)
    const [inPreview, setInPreview] = useState(false)
    const [updateChanges, setUpdateChanges] = useState("")
    const [pressed] = useKeyboardJs("ctrl+s")

    useEffect(() => {
        if (pressed && !isOpen && !edit) {
            onSaveOpen()
        }

    }, [pressed])

    useLeavePageConfirm(pageChanged)

    useEffect(() => {
        if (!saved && dashboard) {
            setSaved(dashboard)
            return
        }


        const changed = !isEqual(dashboard, saved)
        setPageChanged(changed)
        if (changed) {
            setPageChanged(true)
        } else {
            setPageChanged(false)
        }
    }, [dashboard])



    const toast = useToast()
    const onSave = async () => {
        if (inPreview && updateChanges.trim() == "") {
            toast({
                title: "A save message must be provided when saving in history preview mode.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        await requestApi.post("/dashboard/save", { dashboard, changes: updateChanges })
        toast({
            title: "Dashboard saved.",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        setSaved(dashboard)
        setPageChanged(false)
        if (inPreview) {
            location.reload()
        }
        onSaveClose()
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
    const onPreview = (isPreview) => {
        setInPreview(isPreview)
        const msg = isPreview ? "Changed to history preview mode" : "Changed to current dashboard"
        const id = isPreview ? "inPreview" : "notInPreview"
        const duration = isPreview ? 10000 : 2000
        if (!toast.isActive(id)) {
            toast({
                id: id,
                title: msg,
                description: isPreview && "If you want to use preview version, please save it by click save button.",
                status: isPreview ? "info" : "success",
                duration: duration,
                isClosable: true,
            })
        }

    }
    return (
        <>
            <Box>
                <Menu placement="left">
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
                    <DrawerHeader>Dashboard revision history</DrawerHeader>

                    <DrawerBody>
                        <DashboardHistory dashboard={dashboard} onPreview={onPreview} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Modal isOpen={isSaveOpen} onClose={onSaveClose} >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Save dashboard: {dashboard.title}</ModalHeader>
                    <ModalBody>
                        {inPreview && <Alert status='error' flexDirection="column">
                            <AlertIcon />
                            <AlertTitle>Dangerous</AlertTitle>
                            <AlertDescription fontWeight="bold" mt="1">You are previewing a history now, do you want to override current dashboard?</AlertDescription>
                        </Alert>}
                        <FormItem title="describe changes"><Input value={updateChanges} onChange={e => setUpdateChanges(e.currentTarget.value)} placeholder="a message of what has been changed" /></FormItem>
                        {/* <ReactDiffViewer oldValue={JSON.stringify(saved,null,4)} newValue={JSON.stringify(dashboard,null,4)} splitView={true} useDarkTheme={colorMode!="light" } /> */}
                    </ModalBody>

                    <ModalFooter width="100%" justifyContent="space-between">
                            <Button variant="outline" onClick={onViewOpen}>View Changes</Button>
                            <HStack spacing="0">
                                <Button mr={3} onClick={onSaveClose}>
                                    Close
                                </Button>
                                <Button variant='ghost' onClick={onSave} >Submit</Button>
                            </HStack>

                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isViewOpen} onClose={onViewClose} size="full">
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />
                    <ModalBody>
                        <Center mb="2"><Text textStyle="subTitle" fontWeight="bold">Only diff lines will be show, others will be folded</Text></Center>
                        <ReactDiffViewer oldValue={JSON.stringify(saved,null,4)} newValue={JSON.stringify(dashboard,null,4)} splitView={true} useDarkTheme={colorMode!="light" } />
                    </ModalBody>
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
                history.map((h, i) => {
                    const dash = h.dashboard
                    return <Box>
                        <Flex alignItems="center" justifyContent="space-between">
                            <HStack>
                                <Text fontSize="0.9rem">{moment(dash.updated).format("MM-DD HH:mm:ss")}</Text>
                            </HStack>
                            <HStack>
                                {i == 0 && <Tooltip label="click here to continue use current dashboard, and stop previewing"><Tag cursor="pointer" onClick={() => {
                                    // sent two events to ensure the raw dashhboard has no changes, it's weird, but hard to fix
                                    dispatch({ type: SetDashboardEvent, data: dash });
                                    setTimeout(() => {
                                        dispatch({ type: SetDashboardEvent, data: dash });
                                    }, 5000)

                                    onPreview(false)
                                }}>Current</Tag></Tooltip>}
                                {i != 0 && <Button size="xs" variant={dashboard.updated == dash.updated ? "solid" : "outline"} onClick={() => {
                                    dispatch({ type: SetDashboardEvent, data: dash });
                                    onPreview(true)
                                }}>Preview</Button>}
                            </HStack>
                        </Flex>
                        <Text layerStyle="textFourth" fontSize="0.9rem">{h.changes}</Text>
                    </Box>
                })
            }
        </VStack>
    )
}
