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

import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react"
import { useStore } from "@nanostores/react";
import CodeEditor from "components/CodeEditor/CodeEditor"
import React, { useEffect, useState } from "react";
import { commonMsg } from "src/i18n/locales/en";

export const CodeEditorModal = ({ value, onChange }: { value: string; onChange: any }) => {
    const t = useStore(commonMsg)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useState(null)

    useEffect(() => {
        setTemp(value)
    }, [value])

    const onSubmit = () => {
        onChange(temp)
        onClose()
    }

    return (<>
        <Button size="sm" onClick={onOpen} >{t.editFunc}</Button>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader py="2">
                    {t.editFunc}
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody pt="2" pb="0" px="0">
                    <Box height="400px"><CodeEditor value={temp} onChange={v => setTemp(v)} /></Box>
                    <Button onClick={onSubmit} width="100%">{t.submit}</Button>
                </ModalBody>

            </ModalContent>
        </Modal>
    </>
    )
}
