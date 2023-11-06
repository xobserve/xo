// Copyright 2023 xObserve.io Team
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
import React from "react"
import { Modal, ModalContent, ModalOverlay, Text } from "@chakra-ui/react"

interface Props {
    isOpen: any
    text: string
}

const ModalSpinner = ({isOpen,text}:Props) => {
    return (
        <Modal isOpen={isOpen} onClose={null} isCentered>
            <ModalOverlay bg='none'
                backdropFilter='auto'
                backdropInvert='80%'
                backdropBlur='2px' />
            <ModalContent mt="0" px="10" py="6">
                <Text>{text}</Text>
            </ModalContent>
        </Modal>
    )
}

export default ModalSpinner