import {Box, chakra, Flex,  PropsOf} from "@chakra-ui/react"

import React from "react"
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
      <Flex width="100%"> 
          <VerticalNav  bg={props.bg} />
          {children}
      </Flex>
      {/* {showCopyright && <FooterCopyright />} */}
      <BackToTop />
    </>
  )
}

export default PageContainer
