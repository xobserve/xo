import { Alert, AlertDescription, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertIcon, AlertTitle, Box, Button, Text, Textarea, useDisclosure, useToast } from "@chakra-ui/react"
import CodeEditor from "components/CodeEditor/CodeEditor"
import { DetailAlert, DetailAlertItem } from "components/DetailAlert"

import { useRef, useState } from "react"
import { Dashboard } from "types/dashboard"
import { requestApi } from "utils/axios/request"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const MetaSettings = ({ dashboard }: Props) => {
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef()



    const dash = JSON.stringify(dashboard, null, 4)
    const rawMeta = useRef(dash)
    const [meta, setMeta] = useState(dash)

    const onSubmit = async () => {
        await requestApi.post("/dashboard/save", { dashboard: JSON.parse(meta), changes: "modify dashboard meta data" })
        toast({
            title: "Dashboard saved.",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        window.location.reload()
    }

    return (<>
        <Box width="100%" height="500px" className="bordered" mb="3">
            <CodeEditor value={meta} onChange={v => setMeta(v)} language="json" />
        </Box>

        <DetailAlert status="warning" title="Press Ctrl + S to Save your dashboard first!">
            <DetailAlertItem>
                <Text>Before submitting the meta data above, please save your Dashboard first, if it has any changes.</Text>
            </DetailAlertItem>
            <AlertDescription maxWidth='sm'>
                
            </AlertDescription>
        </DetailAlert>

        <Button mt="2" isDisabled={meta == rawMeta.current} onClick={onOpen}>Submit</Button>

        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Submit dashboard meta data
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure to submit? If submit success, page will be reloaded.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme='red' onClick={onSubmit} ml={3}>
                            Submit
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default MetaSettings