import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, HStack, Input, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Switch, Text, Textarea, useDisclosure, VStack } from "@chakra-ui/react"
import { cloneDeep } from "lodash"
import { useEffect, useState } from "react"
import { Dashboard, Panel } from "types/dashboard"
import { PanelType } from "utils/dashboard/panel"
import { PanelComponent } from "../grid/PanelGrid"
import TextPanelEditor from "../plugins/panel/text/PanelEditor"
import PanelAccordion from "./Accordion"
import PanelEditItem from "./PanelEditItem"
import EditItem from "./PanelEditItem"

interface EditPanelProps {
    dashboard: Dashboard
    panel: Panel
    onApply: any
    onDiscard: any
}

const EditPanel = ({ dashboard, panel, onApply, onDiscard }: EditPanelProps) => {
    const [tempPanel, setTempPanel] = useState<Panel>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        if (panel) {
            onOpen()
            setTempPanel(panel)
        } else {
            onClose()
            setTempPanel(null)
        }
    }, [panel])


    const onApplyChanges = () => {
        for (var i = 0; i < dashboard.data.panels.length; i++) {
            if (dashboard.data.panels[i].id === tempPanel.id) {
                dashboard.data.panels[i] = tempPanel
                break
            }
        }

        onApply()
    }

   

    const CustomPanelEditor =  () => {
        const onChange = (panel) => {
            setTempPanel(panel)
        }
        switch (panel?.type) {
            case PanelType.Text:
                return <TextPanelEditor panel={tempPanel} onChange={onChange} />

            default:
                return <></>
        }
    }

    return (<>
        <Modal isOpen={isOpen} onClose={() => { onDiscard(), onClose() }} size="full">
            <ModalOverlay />
            {dashboard && tempPanel && <ModalContent>
                <ModalHeader>
                    <Flex justifyContent="space-between">
                        <Text>{dashboard.title} / Edit Panel</Text>
                        <HStack spacing={0}>
                            <Button onClick={() => { onDiscard(), onClose() }} >Discard</Button>
                            <Button onClick={onApplyChanges}>Apply</Button>
                        </HStack>
                    </Flex>
                </ModalHeader>
                <ModalBody>
                    <HStack height="calc(100vh - 100px)" alignItems="top">
                        <Box width="70%" height="100%">
                            <Box height="50%">
                                <PanelComponent panel={tempPanel} />
                            </Box>
                        </Box>
                        <Box width="30%" >
                            <Box className="top-gradient-border bordered-left bordered-right" >
                                <Text px="2" py="2">Panel</Text>
                                <PanelAccordion title="Basic setting">
                                    <PanelEditItem title="Panel title">
                                        <Input size="sm" value={tempPanel.title} onChange={e => setTempPanel({ ...panel, title: e.currentTarget.value })} />
                                    </PanelEditItem>
                                    <PanelEditItem title="Description" desc="give a short description to your panel">
                                        <Textarea size="sm" value={tempPanel.desc} onChange={e => setTempPanel({ ...panel, desc: e.currentTarget.value })} />
                                    </PanelEditItem>
                                    <PanelEditItem title="Transparent" desc="Display panel without a background.">
                                        <Switch id='panel-transparent' defaultChecked={tempPanel.transparent}   onChange={e => setTempPanel({ ...panel, transparent: e.currentTarget.checked })}/>
                                    </PanelEditItem>
                                </PanelAccordion>
                                
                                <CustomPanelEditor />
                            </Box>

                        </Box>
                    </HStack>
                </ModalBody>
            </ModalContent>}
        </Modal>
    </>)
}

export default EditPanel