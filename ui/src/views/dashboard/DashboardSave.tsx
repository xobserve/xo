import { Box, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import { useLeavePageConfirm } from "hooks/useLeavePage"
import { isEqual } from "lodash"
import { useEffect, useState } from "react"
import { FaRegSave } from "react-icons/fa"
import { Dashboard } from "types/dashboard"
import useKeyboardJs from 'react-use/lib/useKeyboardJs';
import { requestApi } from "utils/axios/request"

interface Props {
    dashboard: Dashboard
}
const DashboardSave = ({ dashboard }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [saved, setSaved] = useState(null)
    const [pageChanged, setPageChanged] = useState(false)

    const [pressed] = useKeyboardJs("ctrl+s")

    useEffect(() => {
        if (pressed) {
            onSave()
        }

    }, [pressed])

    useLeavePageConfirm(pageChanged)

    useEffect(() => {
        if (!saved) {
            setSaved(dashboard)
            return
        }

        const changed = !isEqual(dashboard, saved)
        if (changed) {
            setSaved(dashboard)
            setPageChanged(true)
        }
    }, [dashboard])



    const toast = useToast()
    const onSave = async () => {
        await requestApi.post("/dashboard/save", dashboard)
        toast({
            title: "Dashboard saved.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setSaved(dashboard)
        setPageChanged(false)
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
                        <MenuItem onClick={onSave}>Save</MenuItem>
                        <MenuItem onClick={onOpen}>View history</MenuItem>
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
                        <DashboardHistory dashboard={dashboard} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default DashboardSave

interface HistoryProps {
    dashboard: Dashboard
}

const DashboardHistory = ({dashboard}: HistoryProps) => {
    const [history, setHistory] = useState([])
    
    useEffect(() => {
        load()
    },[])

    const load = async () => {
        const res = await requestApi.get(`/dashboard/history/${dashboard.id}`)
        setHistory(res.data)
    }

    console.log("here3333333d",history)
    return (
        <VStack>

        </VStack>
    )
}
