// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Divider, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, StackDivider, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import CodeEditor from "components/CodeEditor/CodeEditor"
import React, {  useRef, useState } from "react"
import { Panel } from "types/dashboard"
import { $rawDashAnnotations } from "../../store/annotation"
import { Annotation } from "types/annotation"
import ColorTag from "components/ColorTag"
import { dateTimeFormat } from "utils/datetime/formatter"
import AnnotationEditor from "src/views/Annotation/AnnotationEditor"
import { FaEdit, FaTrashAlt } from "react-icons/fa"
import { onRemoveAnnotation } from "src/views/Annotation/Annotations"
import { useStore } from "@nanostores/react"
import Empty from "components/Empty"
import { commonMsg } from "src/i18n/locales/en"
import { requestApi } from "utils/axios/request"
import { EditorNumberItem } from "components/editor/EditorItem"
import { dispatch } from "use-bus"
import { ReloadDashAnnotationsEvent } from "src/data/bus-events"


interface Props {
    dashboardId: string
    panel: Panel
    isOpen: boolean
    onClose: any
    data: any
}
const DebugPanel = ({ dashboardId, panel, isOpen, onClose, data }: Props) => {
    const [tabIndex, setTabIndex] = useState(0)
    return (<Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth="800px">
            <ModalCloseButton />
            <ModalBody>
                <Tabs onChange={(index) => setTabIndex(index)} isLazy >
                    <TabList>
                        <Tab>Panel JSON</Tab>
                        <Tab>Panel Data</Tab>
                        <Tab>Panel Annotations</Tab>
                    </TabList>
                    <TabPanels p="1">
                        <TabPanel h="600px" >
                            <CodeEditor value={JSON.stringify(panel, null, 2)} language="json" readonly />
                        </TabPanel>
                        <TabPanel h="600px">
                            <CodeEditor value={JSON.stringify(data, null, 2)} language="json" readonly />
                        </TabPanel>
                        <TabPanel>
                            <PanelAnnotations panel={panel} dashboardId={dashboardId} />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ModalBody>
        </ModalContent>
    </Modal>
    )
}

export default DebugPanel

interface PanelAnnotationsProps {
    dashboardId: string
    panel: Panel
}

const PanelAnnotations = ({ dashboardId, panel }: PanelAnnotationsProps) => {
    const [annotation, setAnnotation] = useState<Annotation>(null)
    const annotations = useStore($rawDashAnnotations).filter((a) => a.group === panel.id).sort((a, b) => b.time - a.time)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef()
    const t = useStore(commonMsg)
    const toast = useToast()
    const [expires, setExpires] = useState(0)
    const deletelAnnotations = async () => {
        await requestApi.delete(`/annotation/group/${dashboardId}/${panel.id}/${expires}`)
        dispatch(ReloadDashAnnotationsEvent)
        toast({
            title: "Annotations deleted",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        onClose()
    }

    return (<>
        {annotations.length > 0 ? <Box>
            <VStack alignItems="left" divider={<StackDivider />}>
                {
                    annotations.map((anno) => <Flex key={anno.id} justifyContent="space-between" alignItems="center">
                        <Box>
                            <Text>{anno.text}</Text>
                            <HStack width="100%" py="1" spacing={1}>
                                {
                                    anno.tags.map(t => <ColorTag name={t} key={t} />)
                                }
                            </HStack>
                        </Box>

                        <HStack fontSize="0.9rem" spacing={4}>
                            <Box>
                                <Text>Time: &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; {dateTimeFormat(anno.time * 1000)}</Text>
                                <Text>Created: &nbsp; {dateTimeFormat(anno.created)}</Text>
                            </Box>
                            <HStack spacing={3} className="action-icon">
                                <FaEdit cursor="pointer" onClick={() => setAnnotation(anno)} />
                                <FaTrashAlt cursor="pointer" onClick={() => {
                                    onRemoveAnnotation(anno)
                                    // updated.current = true
                                }} />
                            </HStack>
                        </HStack>
                    </Flex>)
                }

            </VStack>
            {annotation && <AnnotationEditor annotation={annotation} onEditorClose={() => {
                    setAnnotation(null)
            }} />}

            <Divider mt="2" />
            <HStack fontSize="0.9rem" alignItems="center" mt="4" fontWeight={550}>
                <Button  colorScheme="red" onClick={onOpen}>Delete Anotations</Button>
                <Text>
                    created more than
                </Text>
                <EditorNumberItem min={0} max={1000} step={1} value={expires} onChange={setExpires}/>
                <Text>days ago</Text>
            </HStack>
        </Box> : <Empty />}

        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete  panel annotations
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {t.deleteAlert}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            {t.cancel}
                        </Button>
                        <Button colorScheme='red' onClick={deletelAnnotations} ml={3}>
                            {t.delete}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}