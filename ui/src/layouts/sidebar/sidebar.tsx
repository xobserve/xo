import { Box, Heading, Stack, VStack } from "@chakra-ui/react"
import Card from "components/card"
import { useRouter } from "next/router"
import * as React from "react"
import { Route } from "src/types/route"
import SidebarLink from "./sidebar-link"


export function SidebarContent(props) {
    const { routes, pathname, contentRef, ...rest } = props
    return (
        <>
            <Stack as="ul">
                {routes.map((route: Route) => {
                    if (route.disabled) { return null }
                    return <SidebarLink as="li" key={route.url} href={route.url} icon={route.icon} {...rest}>
                        <span>{route.title}</span>
                    </SidebarLink>
                })}
            </Stack>
        </>
    )
}

const Sidebar = ({ routes, title, ...props }) => {
    const { pathname } = useRouter()
    const ref = React.useRef<HTMLDivElement>(null)

    return (
        <VStack alignItems="left" width={["180px","180px","250px","250px"]}  height="fit-content" >
            <Card p="5" className="side-card"><Heading size="md" fontSize="1.3rem">{title}</Heading></Card>
            <Card p="0" className="side-card" {...props}>
                <Box
                    ref={ref}
                    as="nav"
                    aria-label="Main Navigation"
                    pos="sticky"
                    sx={{
                        overscrollBehavior: "contain",
                    }}
                    top="8.5rem"
                    p="3"
                    overflowY="auto"
                    className="sidebar-content"
                    flexShrink={0}
                // display={{ base: "none", md: "block" }}
                >
                    <SidebarContent routes={routes} pathname={pathname} contentRef={ref} {...props} />
                </Box>
            </Card>
        </VStack>
    )
}

export default Sidebar

