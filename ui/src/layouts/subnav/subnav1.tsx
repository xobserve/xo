import {  Button,  HStack, VStack, chakra, PropsOf  } from "@chakra-ui/react" 
import Link from "next/link"

import { useRouter } from "next/router"
import * as React from "react"
import { Route } from "src/types/route"


export function SubNavContent(props) {
    const { routes, pathname, contentRef, query, ...rest } = props
    return (
        <>
            <HStack as="ul" spacing="0">
                {routes.map((route: Route) => {
                    if (route.disabled) { return null }
                    return <SidebarLink query={query} as="li" key={route.path} href={route.path} icon={route.icon} {...rest}>
                        <span>{route.title}</span>
                    </SidebarLink>
                })}
            </HStack>
        </>
    )
}

const SubNav1 = ({ routes,showBorder=true, ...props }) => {
    const { pathname } = useRouter()
    const ref = React.useRef<HTMLDivElement>(null)

    return (
        <VStack alignItems="left" width="100%">
            <SubNavContent  routes={routes} pathname={pathname} contentRef={ref} {...props}/>
        </VStack>
    )
}

export default SubNav1







const StyledLink = React.forwardRef(function StyledLink(
  props: PropsOf<typeof chakra.a> & { isActive?: boolean },
) {
  const { isActive, icon,children, ...rest } = props
  return (
    <Button
      as="a"
      size="sm" 
      colorScheme={isActive ? "brand" : "grey"} 
      variant={isActive? "solid" : "ghost"} 
      _focus={{ border: null }}
      {...rest}
    >
      <chakra.span>{children}</chakra.span>
    </Button>
  )
})

type SidebarLinkProps = PropsOf<typeof chakra.div> & {
  href?: string
  icon?: React.ReactElement
  query?: any
}

const SidebarLink = (props: SidebarLinkProps) => {
  const { href, icon, children,query, exactPath=false, ...rest } = props

  const { asPath } = useRouter()
  let isActive;

  if (exactPath) {
    isActive = asPath.split('?')[0] == href
  } else {
    isActive = asPath.startsWith(href) 
  }

  return (
    <chakra.div
      userSelect="none"
      display="flex"
      alignItems="center"
      lineHeight="1.5rem"
      cursor="pointer"
      {...rest}
    > 
    {/* <NextLink href={{pathname: href,query: query}}  passHref></NextLink> */}
      <Link href={href}>
        <StyledLink isActive={isActive} icon={icon}>{children}</StyledLink>
      </Link>
    </chakra.div>
  )
}

