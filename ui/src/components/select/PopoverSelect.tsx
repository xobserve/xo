import { Box, Flex, HStack, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { Variant } from "chakra-react-select/dist/types/types"
import { remove } from "lodash"
import { MouseEvent, useMemo, useRef, useState } from "react"
import { FaArrowDown, FaCheck, FaMinus, FaPlus, FaTimes } from "react-icons/fa"

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
}

const PopoverSelect = ({ value, options, onChange, variant = "outline", customOption = null, placeholder = "", size = "sm", isClearable = false, isMulti = false, exclusive }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false)
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
            setIsOpen(false)
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
    },[options, query])
    
    const getBorderStyle = () => {
        if (variant == "outline") return "bordered"
        if (variant == "flushed") return "bordered-bottom"
        if (variant == "unstyled") return ""
    }

    const clearSelected = (e:MouseEvent) => {
        e.stopPropagation()
        onChange([])
    }
    return (<>

        <Popover isOpen={isOpen} initialFocusRef={ref} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
            <PopoverTrigger>
                {!isOpen ? <Flex height="100%" className={getBorderStyle()} py="1" px="2" justifyContent="space-between" alignItems="center" cursor="pointer"><Box layerStyle="textSecondary">{value.length > 0 ? value.join(' + ') : placeholder}</Box> {!isMulti && isClearable && value.length > 0 ? <FaTimes fontSize="0.8rem" onClick={clearSelected}  /> :<FaArrowDown fontSize="0.6rem" />}</Flex> : <></>}
            </PopoverTrigger>
            <PopoverContent >
                <PopoverArrow />
                <PopoverBody p="0">
                    <Box>
                        <Input value={query} onChange={e => {setQuery(e.currentTarget.value)}} ref={ref} size={size} variant="flushed" placeholder="enter to search" />
                    </Box>

                  
                        {isMulti && <HStack className="hover-bg" py="2" px="2" cursor="pointer" fontSize="0.9rem" onClick={onClickSelect}>
                            <Box color="brand.500" fontSize="0.6rem" width="12px">{value.length > 0 ? <FaMinus />:<FaPlus />}</Box>
                            <Text >Selected {value.length}</Text>
                        </HStack>}

                    <VStack alignItems="left"  spacing="0" maxH="300px" overflowY="scroll">
                        {
                            searchedResult.map(option => <HStack key={option.label} className="hover-bg" py="1" px="2" cursor="pointer" onClick={() => onOptionClick(option)} fontSize="0.9rem">
                                <Box color="brand.500" fontSize="0.6rem" width="12px">{value.includes(option.value) && <FaCheck />}</Box>
                                {customOption ? customOption(option)  :  <Text>{option.label}</Text>} 
                            </HStack>)
                        }
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    </>)
}

export default PopoverSelect