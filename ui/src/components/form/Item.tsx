import { Box, Flex, HStack, Text, Tooltip } from "@chakra-ui/react"
import { IoMdInformationCircleOutline } from "react-icons/io"

interface Props {
    title: any
    children?: any
    labelWidth?: string
    desc?: string
    px?: number | string
    colorSchema?: "gray" | "brand"
    size?: "sm" | "md" | "lg"
    spacing?: number
}

const FormItem = ({ title, children, labelWidth = "fit-content", desc = null, px = 3,  colorSchema="gray" ,size="md",spacing=2 }:Props) => {
    return (
        <HStack alignItems="top"  spacing={spacing}>
            <HStack pos="relative"  alignItems="center" height={`${size=="md" ? 'var(--chakra-sizes-10)' : (size=="sm" ? 'var(--chakra-sizes-8)' : 'var(--chakra-sizes-12)')}`} px={px}  minWidth="fit-content" className={colorSchema == "gray" ? "label-bg" : "tag-bg"} fontSize={size=="lg" ? "1rem" : "0.9rem"} borderRadius="1px">
                {typeof title == "string" ?  <Text width={labelWidth} className="form-item-label">{title}</Text> :<Box  width={labelWidth} className="form-item-label">{title}</Box>}
                {desc && <Tooltip label={desc}><Box position={"absolute" } right="2"><IoMdInformationCircleOutline /></Box></Tooltip>}
            </HStack>
            {children}
        </HStack>
    )
}

export default FormItem