import { Box, Divider, Heading, HStack, Stack, VStack } from "@chakra-ui/react"
import SidebarLink from "src/layouts/sidebar/sidebar-link"
import React from "react"
import { Route } from "src/types/route"
import { useLocation } from "react-router-dom"


export function SubNavContent(props) {
    const { routes, pathname, contentRef, query, ...rest } = props
    return (
        <>
            <HStack as="ul">
                {routes.map((route: Route) => {
                    if (route.disabled) { return null }
                    return <SidebarLink query={query} as="li" key={route.url} href={route.url} icon={route.icon} {...rest}>
                        <span>{route.title}</span>
                    </SidebarLink>
                })}
            </HStack>
        </>
    )
}

const SubNav = ({ routes,showBorder=true, ...props }) => {
    const {pathname} = useLocation()
    const ref = React.useRef<HTMLDivElement>(null)

    return (
        <VStack alignItems="left" width="100%">
            <SubNavContent  routes={routes} pathname={pathname} contentRef={ref} {...props}/>
            {showBorder && <Divider />}
        </VStack>
    )
}

export default SubNav

