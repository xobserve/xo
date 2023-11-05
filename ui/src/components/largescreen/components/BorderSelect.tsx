// Copyright 2023 observex.io Team
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
import {  Button, Center, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, SimpleGrid, Text, VStack, useDisclosure } from "@chakra-ui/react"

import { PanelBorderType } from "types/panel/styles"
import Border from "./Border"
import React from "react"
interface Props {
    value: string
    onChange: any
}

const BorderSelect = ({ value, onChange }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <>
            <Button variant="outline" size="sm" onClick={onOpen}>{value}</Button>
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />
                    <ModalBody>
                        <SimpleGrid minChildWidth='300px' spacing='40px'>
                            {
                                Object.keys(PanelBorderType).map((key) => {
                                    return <HStack width="300px" className={PanelBorderType[key] == value ? "highlight-bordered hover-bg" : "hover-bg"} alignItems="top" cursor="pointer" p="2" onClick={() => { onChange(PanelBorderType[key]); onClose() }} sx={{
                                        '.dv-decoration-1': {
                                            zIndex: '2000!important'
                                        }
                                    }}>
                                        <Border border={PanelBorderType[key]} width="100%" height="100%">
                                            <Center py="4"><Text>{key}</Text></Center>
                                        </Border>

                                    </HStack>
                                })
                            }
                        </SimpleGrid>
                    </ModalBody>

                </ModalContent>
            </Modal>

        </>
    )
}

export default BorderSelect