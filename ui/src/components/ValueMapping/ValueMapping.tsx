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

import { Button } from "@chakra-ui/button"
import { useDisclosure } from "@chakra-ui/hooks"
import { HStack, StackDivider, Text, VStack } from "@chakra-ui/layout"
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/modal"

import { useStore } from "@nanostores/react"
import { Select } from "antd"
import { cloneDeep } from "lodash"
import React, { memo, useState } from "react"
import { FaPlus } from "react-icons/fa"
import { ValueMappingMsg, commonMsg } from "src/i18n/locales/en"
import { ValueMappingItem } from "types/dashboard"
const { Option } = Select
interface Props {
    value: ValueMappingItem[]
    onChange: any
}
const ValueMapping = memo((props: Props) => {
    const { onChange } = props
    if (!props.value) {
        onChange([])
        return
    }

    const t = useStore(commonMsg)
    const t1 = useStore(ValueMappingMsg)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [value, setValue] = useState<ValueMappingItem[]>(props.value)

    const onAdd = () => {
        setValue([...value, {
            type: 'value',
            value: '',
            text: '',
            color: null
        }])
    }

    const onSubmit = () => {
        onChange(value)
        onClose()
    }
    console.log("here333333:", value)
    return (<>
        <Button size="sm" colorScheme="gray" onClick={onOpen}>{t.editItem({ name: t.valueMapping })}</Button>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="700px">
                <ModalHeader>{t.valueMapping}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack alignItems="left" divider={<StackDivider />} spacing={3}>
                        {
                            value.map((v, i) => {
                                return <HStack key={i + v.type + v.value}>
                                    <Select
                                        style={{ width: '150px' }}
                                        placeholder="mapping type"
                                        value={v.type}
                                        onChange={v => {
                                            value[i].type = v
                                            setValue(cloneDeep(value))
                                        }}
                                        popupMatchSelectWidth={false}
                                        optionLabelProp="label"
                                        bordered={false}
                                    >
                                        {
                                            typeOptions.map((t, i) => {
                                                return <Option value={t.value} label={t.label}>
                                                    <Text fontWeight={550}>{t.label}</Text>
                                                    <Text textStyle="annotation" fontSize="0.9rem">{t.desc}</Text>
                                              </Option>
                                            })
                                        }
                                    </Select>
                                </HStack>
                            })

                        }
                    </VStack>
                </ModalBody>

                <ModalFooter justifyContent="space-between">
                    <Button variant="ghost" leftIcon={<FaPlus />} onClick={onAdd}>{t.newItem({ name: t.valueMapping })}</Button>

                    <HStack spacing={3}>
                        <Button variant="outline" onClick={onClose}>
                            {t.cancel}
                        </Button>
                        <Button variant='solid' onClick={onSubmit}>{t.submit}</Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>)
})

export default ValueMapping

const typeOptions = [
    {
        label: 'Value',
        value: 'value',
        desc: 'Exactly match with several text values',
        placeholder: 'a,b,c means you can match with a or b or c'
    },
    {
        label: 'Range',
        value: "range",
        desc: 'Match a range of numbers',
        placeholder: 'from, e.g 1',
        placehoer1: 'to, e.g 10',
    },
    {
        label: 'Regex',
        value: 'regex',
        desc: 'Match a regular expression pattern',
        placeholder: 'Regular expression pattern'
    },
    {
        label: 'Null',
        value: 'null',
        desc: "Match null, undefined, empty string or NaN",
    }
]