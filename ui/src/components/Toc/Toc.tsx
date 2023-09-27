import { Heading, Text, useColorModeValue, VStack } from "@chakra-ui/react"
import React, { useState } from "react"
import customColors from "theme/colors"
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";


const Toc = ({toc}) => {
    const [activeId, setActiveId] = useState(null);
    useIntersectionObserver('.markdown-render',setActiveId);

    return <VStack alignItems="left"  background={useColorModeValue(customColors.primaryColor.light, customColors.bodyBg.dark)}  py="2" maxH="100vh" overflowY="auto">
    {
        toc.map(t => {
            const level = Number(t.level)
            const id = t.content.toLowerCase().replace(/[?\s]/g, "-")
            return <Heading py="2px" px="2" className={activeId == id ? "label-bg" : null}  pl={15 * level + 'px'} fontSize="0.9rem" color={useColorModeValue(activeId == id ?  "inherit" : "white", "brand.500" )} cursor="pointer" onClick={() => {
                const el = document.getElementById(id)
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" })
                }

            }}>{t.content}</Heading>
        })
    }
</VStack>
}

export default Toc