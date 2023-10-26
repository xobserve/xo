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
import React from "react"
import { Box, Flex, HStack, Input, Placement, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, Tooltip, VStack, useDisclosure, useMediaQuery } from "@chakra-ui/react"
import { Variant } from "chakra-react-select/dist/types/types"
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import {  FaCheck, FaChevronDown,  FaTimes } from "react-icons/fa"
import { MobileBreakpoint } from "src/data/constants"
import { isEmpty } from "utils/validate"

interface Value {
    value: string
    label: string
    subLabel?: string
    annotation?: string
}

interface SelectProps {
    value?: string
    label?: string
    onChange?: (value: string) => void
    options?: Value[]
    variant?: Variant
    customOption?: any
    placeholder?: string
    size?: "sm" | "md" | "lg"
    isClearable?: boolean
    exclusive?: string
    placement?: Placement
    showArrow?: boolean
    closeOnBlur?: boolean
    matchWidth?: boolean
    enableInput?: boolean
    width?: string
    annotationDir?: "horizontal" | "vertical"
}

const InputSelect = ({ value,label, options, onChange, variant = "outline", customOption = null, placeholder = "...", size = "sm", isClearable = false, placement="bottom", showArrow = true,closeOnBlur=true ,matchWidth=true,enableInput=true,width="200px",annotationDir="horizontal"}: SelectProps) => {
    const { isOpen, onToggle, onClose } = useDisclosure()
    const [entered, setEntered] = useState(false)
    const [query, setQuery] = useState('')

    useEffect(() => {
        if (enableInput) {
            setQuery(label??(value??''))
        }
    },[value,label])

    const ref = useRef(null)

    const onOptionClick = option => {
        onChange(option.value)
        onToggle()
        setEntered(false)
    }

    const searchedResult = useMemo(() => {
        const q = query.trim()
        if (!entered ||  q == "") {
            return options
        }

        return options.filter(o => (label !== null ? o.label :  o.value).toLowerCase().indexOf(q) >= 0)
    }, [options, query])

    const getBorderStyle = () => {
        if (variant == "outline") return "bordered"
        if (variant == "flushed") return "bordered-bottom"
        if (variant == "unstyled") return ""
    }

    const clearSelected = (e: MouseEvent) => {
        e.stopPropagation()
        onChange('')
    }

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    return (<>
        {<Flex height={`${size=="md" ? 'var(--chakra-sizes-10)' : (size=="sm" ? 'var(--chakra-sizes-8)' : 'var(--chakra-sizes-12)')}`} px="3" className={getBorderStyle()} py="1"  justifyContent="space-between" alignItems="center" cursor="pointer" onClick={onToggle}><Tooltip placement="right" openDelay={500} label={value}><Text width={width} maxW={width}  noOfLines={1} layerStyle="textSecondary" opacity="0.7">{label ?? (isEmpty(value)? placeholder : value)}</Text></Tooltip> {isClearable && value ? <FaTimes fontSize="0.8rem" onClick={clearSelected} opacity="0.6"/> :  showArrow && <Box pl="1"><FaChevronDown fontSize="0.7em" /></Box>}</Flex>}
        <Popover matchWidth={matchWidth} closeOnBlur={closeOnBlur}    placement={placement} isOpen={isOpen} initialFocusRef={ref} onClose={onClose}>
            <PopoverTrigger >
                <Box position="absolute"></Box>
            </PopoverTrigger>
            <Portal>
                <PopoverContent  borderRadius={2} width={isLargeScreen ? "500px" : "240px"}>
                    {/* <PopoverArrow /> */}
                    <PopoverBody p="0">
                        <Box>
                            <Input px="2" py="2" value={query} onChange={e => { setQuery(e.currentTarget.value.toLowerCase());if (!entered) {setEntered(true)} }} ref={ref} size={size} variant="unstyled" className="bordered-bottom"  placeholder="input to search, press Enter to use current input" onKeyDown={e => {
                                 if (enableInput &&  e.key === 'Enter') {
                                    onChange(query)
                                    onToggle()
                                    setEntered(false)
                                }
                            }} />
                        </Box>


                        <VStack alignItems="left" spacing="0" maxH="300px" overflowY="auto">
                            {
                                searchedResult.map(option => <HStack key={option.label} className="hover-bg" py="1" px="2" cursor="pointer" onClick={() => onOptionClick(option)} fontSize="1em">
                                    <Box color="brand.500" fontSize="0.7em" width="12px">{value == option.value && <FaCheck />}</Box>
                                    {customOption ? customOption(option) : <Flex flexDirection={annotationDir == "horizontal" ? "row" : "column"} justifyContent="space-between" width="100%">
                                        <HStack alignItems="end">
                                            <Text>{option.label}</Text>
                                            {!isEmpty(option.subLabel) && <Text textStyle="annotation">{option.subLabel}</Text>}
                                        </HStack>
                                        {!isEmpty(option.annotation) && <Text textStyle="annotation">{option.annotation}</Text>}
                                        </Flex>}
                                </HStack>)
                            }
                        </VStack>
                    </PopoverBody>
                </PopoverContent>
                </Portal>
        </Popover>
    </>)
}

export default InputSelect