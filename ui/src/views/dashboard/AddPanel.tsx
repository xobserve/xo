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
import { Button, Modal, ModalBody, ModalContent, ModalOverlay, useColorModeValue, useDisclosure, VStack } from "@chakra-ui/react";
import IconButton from "src/components/button/IconButton";
import { PanelAdd } from "src/components/icons/PanelAdd";
import { StorageCopiedPanelKey } from "src/data/constants";
import { initPanel } from "src/data/panel/initPanel";
import { Dashboard,  Panel } from "types/dashboard";
import storage from "utils/localStorage";
import React from "react";
import { useStore } from "@nanostores/react";
import { dashboardMsg } from "src/i18n/locales/en";

interface Props {
    dashboard: Dashboard
    onChange: any
}

const AddPanel = ({ dashboard, onChange }: Props) => {
    const t1 = useStore(dashboardMsg )
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
                        <Button onClick={() => { onAddPanel(); onClose() }} variant="outline">{t1.addPanel}</Button>
                        <Button onClick={() => { onPastePanel(); onClose() }}>{t1.pastePanel}</Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default AddPanel