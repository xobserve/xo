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
  fullscreen?: boolean
}


function PageContainer(props: PageContainerProps) {
  const { children, nav, title = "Datav", showWidgetes = false, showCopyright = true,fullscreen=false, ...rest } = props
  return (
    <>
      <Flex width="100%">
          <VerticalNav fullscreen={fullscreen} />
          {children}
      </Flex>
      {/* {showCopyright && <FooterCopyright />} */}
      <BackToTop />
    </>
  )
}

export default PageContainer
