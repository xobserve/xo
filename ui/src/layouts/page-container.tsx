// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Box, chakra, Flex,  PropsOf} from "@chakra-ui/react"

import React from "react"
import BackToTop from "components/BackToTop"
import Sidebar from "./sidebar/Sidebar"



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
          <Sidebar  bg={props.bg} />
          {children}
      </Flex>
      {/* {showCopyright && <FooterCopyright />} */}
      <BackToTop />
    </>
  )
}

export default PageContainer
