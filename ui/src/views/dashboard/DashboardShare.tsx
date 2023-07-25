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

import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, StyleProps, useDisclosure } from "@chakra-ui/react"
import React from "react"
import { BsShare } from "react-icons/bs"
import { Dashboard } from "types/dashboard"

interface Props extends StyleProps {
    dashboard: Dashboard
    className: string
}

const DashboardShare = ({ dashboard, ...rest }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (<>
        <Box onClick={onOpen} {...rest}><BsShare /></Box>
        
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Share</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default DashboardShare