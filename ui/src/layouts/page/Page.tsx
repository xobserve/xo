import { Box, Heading, HStack, Text, useColorModeValue } from "@chakra-ui/react"
import PageContainer from "layouts/page-container"
import customColors from "src/theme/colors"
import { Route } from "types/route"
import React from "react"
import { Link } from "react-router-dom"
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"

interface Props {
    title: string
    subTitle?: string
    icon?: any
    children: React.ReactNode
    tabs?: Route[]
}

const Page = (props: Props) => {
    const t = useStore(commonMsg)  
    const { title, subTitle, icon, children, tabs } = props

    const borderColor = useColorModeValue(customColors.borderColor.light, customColors.borderColor.dark)
    const border = `1px solid ${borderColor}`

    const activeTab = tabs?.find(tab => tab.url === window.location.pathname)
    return (<PageContainer>
        <Box width="100%">
            <HStack spacing="4" px="12" pt="10" pb="10">
                <Box fontSize="40px">{icon}</Box>
                <Box>
                    <Box textStyle="mainTitle">{title}</Box>
                    <Text mt="1" ml="1">{subTitle}</Text>
                </Box>


            </HStack>
            <HStack px="12" spacing="8" borderBottom={border} >
                {tabs?.map((tab, index) => {
                    return <Link to={tab.url} key={index} > 
                    <HStack spacing="2" borderLeft={tab.url == activeTab.url ? border: null} borderRight={tab.url == activeTab.url ? border: null} cursor="pointer">
                        <Box className={ tab.url == activeTab.url ? "top-gradient-border" : null} >
                            <HStack py="2" px="4" >
                                {tab.icon}
                                <Text>{t[tab.title]}</Text>
                            </HStack>
                        </Box>
                    </HStack>
                    </Link>
                })}
            </HStack>

            <Box mt="8" px="12">
                {children}
            </Box>
        </Box>
    </PageContainer>)
}

export default Page