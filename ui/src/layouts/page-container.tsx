import {Box, chakra, Flex,  PropsOf} from "@chakra-ui/react"
import FooterCopyright from "./footer/copyright"

import * as React from "react"
import siteConfig from "src/data/configs/site-config.json"
import BackToTop from "components/back-to-top"
import VerticalNav from "./nav/vertical-nav"



type PageContainerProps = PropsOf<typeof chakra.div> & {
  children: React.ReactNode
  nav?: any
  showWidgetes?: boolean
  showCopyright?: boolean
  bg?: string
}


function PageContainer(props: PageContainerProps) {
  const { children, nav, title = "Datav", showWidgetes = false, showCopyright = true, ...rest } = props
  return (
    <>
      <Flex width="100%" position="relative" className="main-view" flexDirection="row" height="100%" flex="1 1 0"> 
          <VerticalNav  bg={props.bg} />
          {children}
      </Flex>
      {/* {showCopyright && <FooterCopyright />} */}
      <BackToTop />
    </>
  )
}

export default PageContainer
