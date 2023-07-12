import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react"
import CodeEditor from "components/CodeEditor/CodeEditor"
import React, { useEffect, useState } from "react";

export const CodeEditorModal = ({ value, onChange }: { value: string; onChange: any }) => {
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
        <Button size="sm" onClick={onOpen} >Edit function</Button>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader py="2">
                    Edit registerEvents function
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody pt="2" pb="0" px="0">
                    <Box height="400px"><CodeEditor value={temp} onChange={v => setTemp(v)} /></Box>
                    <Button onClick={onSubmit} width="100%">Submit</Button>
                </ModalBody>

            </ModalContent>
        </Modal>
    </>
    )
}
