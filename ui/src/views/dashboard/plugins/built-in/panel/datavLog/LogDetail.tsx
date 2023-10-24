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
import { Drawer, DrawerBody, DrawerContent, DrawerOverlay, useColorModeValue, useMediaQuery, useTheme } from "@chakra-ui/react"
import React from "react"
import { IsSmallScreen } from "src/data/constants"
import { Field } from "types/seriesData"


interface Props {
    log: Field[]
    isOpen: boolean
    onClose: any
}
const LogDetail = ({log, isOpen, onClose}: Props) => {
    const [isMobileScreen] = useMediaQuery(IsSmallScreen)
    const theme = useTheme()
    console.log("here333333:",theme)
    return (<Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        size={isMobileScreen ? "sm" : "lg"}
      >
        <DrawerOverlay />
        <DrawerContent>

          <DrawerBody>
          </DrawerBody>
        </DrawerContent>
      </Drawer>)
}

export default LogDetail