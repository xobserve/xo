import { Text, useColorModeValue } from "@chakra-ui/react"
import React from "react"

const ColorKV = ({ k, v, renderString=true, colorK=true}) => {
    const isString = typeof v == "string"
    return (<>
        <Text color={colorK && "rgb(131, 120, 255)"} minW="fit-content">{k}</Text>
        <Text color={isString ? useColorModeValue("rgb(0, 166, 0)", "rgb(166, 226, 46)") : useColorModeValue("rgb(253, 130, 31)", "rgb(253, 151, 31)")} >{renderString && isString ? `"${v}"` : v}</Text>
    </>)
}


export default ColorKV