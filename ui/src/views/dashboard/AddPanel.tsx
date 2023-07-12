import { Button, Modal, ModalBody, ModalContent, ModalOverlay, useColorModeValue, useDisclosure, VStack } from "@chakra-ui/react";
import IconButton from "components/button/IconButton";
import { PanelAdd } from "components/icons/PanelAdd";
import { StorageCopiedPanelKey } from "src/data/constants";
import { initPanel } from "src/data/panel/initPanel";
import { Dashboard,  Panel } from "types/dashboard";
import storage from "utils/localStorage";
import React from "react";

interface Props {
    dashboard: Dashboard
    onChange: any
}

const AddPanel = ({ dashboard, onChange }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const addPanel = () => {
        const copiedPanel = storage.get(StorageCopiedPanelKey)
        if (copiedPanel) {
            onOpen()
            return
        }

        onAddPanel()
    };



    const getNextPanelId = () => {
        let max = 0;

        for (const panel of dashboard.data.panels) {
            if (panel.id > max) {
                max = panel.id;
            }
        }

        return max + 1;
    }


    const onAddPanel = () => {
        if (!dashboard.data.panels) {
            dashboard.data.panels = []
        }
        const id = getNextPanelId()
        const newPanel: Panel = initPanel(id)


        // scroll to top after adding panel
        window.scrollTo(0, 0);

        onChange(dashboard => { dashboard.data.panels.unshift(newPanel) })
    }
    const onPastePanel = () => {
        const copiedPanel = storage.get(StorageCopiedPanelKey)
        storage.remove(StorageCopiedPanelKey)
        if (copiedPanel) {
            const id = getNextPanelId()
            copiedPanel.id = id
            onChange(dashboard => { dashboard.data.panels.unshift(copiedPanel) })
            return
        }
    }

    return (<>
        <IconButton onClick={addPanel} variant="ghost"><PanelAdd size={28} fill={useColorModeValue("var(--chakra-colors-brand-500)", "var(--chakra-colors-brand-200)")} /></IconButton>
        <Modal isOpen={isOpen} onClose={onClose} >
            <ModalOverlay />
            <ModalContent mt="20%">
                <ModalBody py="10">
                    <VStack alignItems={"left"}>
                        <Button onClick={() => { onAddPanel(); onClose() }} variant="outline">Add new panel</Button>
                        <Button onClick={() => { onPastePanel(); onClose() }}>Paste panel from clipboard</Button>
                    </VStack>

                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default AddPanel