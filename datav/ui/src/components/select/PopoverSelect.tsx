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
import React from "react"
import { Box, Flex, HStack, Input, Placement, Popover, PopoverBody, PopoverContent, PopoverTrigger, Text, Tooltip, VStack, useDisclosure, Portal, useColorModeValue } from "@chakra-ui/react"
import { Variant } from "chakra-react-select/dist/types/types"
import { remove } from "lodash"
import { MouseEvent, useMemo, useRef, useState } from "react"
import { FaCheck, FaChevronDown, FaMinus, FaPlus, FaTimes } from "react-icons/fa"

interface Value {
    value: string,
    label: string
}

interface SelectProps {
    value?: string[]
    onChange?: (value: string[]) => void
    options?: Value[]
    variant?: Variant
    customOption?: any
    placeholder?: string
    size?: "sm" | "md" | "lg"
    isClearable?: boolean
    isMulti?: boolean
    exclusive?: string
    placement?: Placement
    showArrow?: boolean
    closeOnBlur?: boolean
    matchWidth?: boolean
}

const PopoverSelect = ({ value, options, onChange, variant = "outline", customOption = null, placeholder = "...", size = "sm", isClearable = false, isMulti = false, exclusive, placement = "bottom", showArrow = true, closeOnBlur = true, matchWidth = true }: SelectProps) => {
    const { isOpen, onToggle, onClose } = useDisclosure()

    const [query, setQuery] = useState('')

    const ref = useRef(null)

    const onOptionClick = option => {
        if (isMulti) {
            let res = [...value]
            if (exclusive != '') {
                if (option.value == exclusive) {
                    onChange([exclusive])
                    return
                }

                if (res.includes(exclusive)) {
                    remove(res, r => r == exclusive)
                }
            }


            if (value.includes(option.value)) {
                res = res.filter(v => v != option.value)
            } else {
                res.push(option.value)
            }

            onChange(res)
        } else {
            onChange([option.value])
            onToggle()
        }
    }

    const onClickSelect = () => {
        let res = []
        if (value.length == 0) {
            options.forEach(o => {
                if (o.value != exclusive) {
                    res.push(o.value)
                }
            })
        }

        onChange(res)
    }


    const searchedResult = useMemo(() => {
        const q = query.trim()
        if (q == "") {
            return options
        }

        return options.filter(o => o.value.indexOf(q) >= 0)
    }, [options, query])

    const getBorderStyle = () => {
        if (variant == "outline") return "bordered"
        if (variant == "flushed") return "bordered-bottom"
        if (variant == "unstyled") return ""
    }

    const clearSelected = (e: MouseEvent) => {
        e.stopPropagation()
        onChange([])
    }


    return (<>
        {<Flex height="100%" px="1" className={getBorderStyle()} py="1" justifyContent="space-between" alignItems="center" cursor="pointer" onClick={onToggle}>
            <Tooltip placement="right" openDelay={500} label={value.length > 0 && value.join(' + ')}>
                <Text width="fit-content" maxW="250px" wordBreak="break-all" noOfLines={1} layerStyle="textSecondary" opacity={useColorModeValue(0.7,null)}  fontSize="0.95em">
                    {value.length > 0 ? value.join(' + ') : placeholder}
                </Text>
            </Tooltip> {!isMulti && isClearable && value.length > 0
                ?
                <FaTimes fontSize="0.9em" onClick={clearSelected} />
                :
                showArrow && <Box pl="1"><FaChevronDown fontSize="0.8em" /></Box>}</Flex>}
        <Popover matchWidth={matchWidth} closeOnBlur={closeOnBlur} placement={placement} isOpen={isOpen} initialFocusRef={ref} onClose={onClose}>
            <PopoverTrigger >
                <Box position="absolute"></Box>
            </PopoverTrigger>
            <Portal>
                <PopoverContent borderRadius={2}>
                    {/* <PopoverArrow /> */}
                    <PopoverBody p="0">
                        <Box>
                            <Input px="2" py="2" value={query} onChange={e => { setQuery(e.currentTarget.value) }} ref={ref} size={size} variant="unstyled" className="bordered-bottom" placeholder="enter to search" />
                        </Box>


                        {isMulti && <HStack className="hover-bg" py="2" px="2" cursor="pointer" fontSize="0.9em" onClick={onClickSelect}>
                            <Box color="brand.500" fontSize="0.8em" width="12px">{value.length > 0 ? <FaMinus /> : <FaPlus />}</Box>
                            <Text >Selected {value.length}</Text>
                        </HStack>}

                        <VStack alignItems="left" spacing="0" maxH="300px" overflowY="auto">
                            {
                                searchedResult.map(option => <HStack key={option.label} className="hover-bg" py="1" px="2" cursor="pointer" onClick={() => onOptionClick(option)} fontSize="0.9em">
                                    <Box color="brand.500" fontSize="0.8em" width="12px">{value.includes(option.value) && <FaCheck />}</Box>
                                    {customOption ? customOption(option) : <Text>{option.label}</Text>}
                                </HStack>)
                            }
                        </VStack>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    </>)
}

export default PopoverSelect