import { Box, Flex, HStack, Input, Placement, Popover, PopoverBody, PopoverContent, PopoverTrigger, Text, Tooltip, VStack, useDisclosure } from "@chakra-ui/react"
import { Variant } from "chakra-react-select/dist/types/types"
import { Portal } from "components/portal/Portal"
import { remove } from "lodash"
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import {  FaCheck, FaChevronDown, FaMinus, FaPlus, FaTimes } from "react-icons/fa"

interface Value {
    value: string,
    label: string
}

interface SelectProps {
    value?: string
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
}

const InputSelect = ({ value, options, onChange, variant = "outline", customOption = null, placeholder = "...", size = "sm", isClearable = false, placement="bottom", showArrow = true,closeOnBlur=true ,matchWidth=true}: SelectProps) => {
    const { isOpen, onToggle, onClose } = useDisclosure()

    const [query, setQuery] = useState('')

    useEffect(() => {
        setQuery(value??'')
    },[value])

    const ref = useRef(null)

    const onOptionClick = option => {
            onChange(option.value)
            onToggle()
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
        onChange('')
    }

    return (<>
        {<Flex height="100%" px="1" className={getBorderStyle()} py="1"  justifyContent="space-between" alignItems="center" cursor="pointer" onClick={onToggle}><Tooltip placement="right" openDelay={500} label={value}><Text width="fit-content"  noOfLines={1} layerStyle="textSecondary" opacity="0.7" fontSize={size == "sm" ? "0.9rem" : "1rem"}>{value?? placeholder}</Text></Tooltip> {isClearable && value ? <FaTimes fontSize="0.8rem" onClick={clearSelected} /> :  showArrow && <Box pl="1"><FaChevronDown fontSize="0.6rem" /></Box>}</Flex>}
        <Popover matchWidth={matchWidth} closeOnBlur={closeOnBlur}    placement={placement} isOpen={isOpen} initialFocusRef={ref} onClose={onClose}>
            <PopoverTrigger >
                <Box position="absolute"></Box>
            </PopoverTrigger>
            <Portal>
                <PopoverContent  borderRadius={2} width="500px">
                    {/* <PopoverArrow /> */}
                    <PopoverBody p="0">
                        <Box>
                            <Input px="2" py="2" value={query} onChange={e => { setQuery(e.currentTarget.value) }} ref={ref} size={size} variant="unstyled" className="bordered-bottom"  placeholder="input to search, press Enter to use current input" onKeyDown={e => {
                                 if (e.key === 'Enter') {
                                    onChange(query)
                                }
                            }} />
                        </Box>


                        <VStack alignItems="left" spacing="0" maxH="300px" overflowY="scroll">
                            {
                                searchedResult.map(option => <HStack key={option.label} className="hover-bg" py="1" px="2" cursor="pointer" onClick={() => onOptionClick(option)} fontSize="0.9rem">
                                    <Box color="brand.500" fontSize="0.6rem" width="12px">{value == option.value && <FaCheck />}</Box>
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

export default InputSelect