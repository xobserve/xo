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

import { Box } from "@chakra-ui/layout"
import { Popover, PopoverBody, PopoverContent, PopoverHeader, PopoverTrigger } from "@chakra-ui/popover"
import { PlacementWithLogical } from "@chakra-ui/popper"
import { Portal } from "@chakra-ui/portal"
import React from "react"

interface Props {
    trigger?: "hover" | "click"
    triggerComponent: React.ReactNode
    offset?: [number, number]
    showHeaderBorder?: boolean
    headerComponent: React.ReactNode
    bodyComponent?: React.ReactNode
    contentMinWidth?: string
    placement?: PlacementWithLogical
}
const PopoverTooltip = (props: Props) => {
    const { trigger="hover", triggerComponent, offset = null, showHeaderBorder = false, headerComponent, bodyComponent=null, contentMinWidth = "120px", placement = "right-start" } = props
    return (<>
        <Popover trigger={trigger} placement={placement} offset={offset}>
            <PopoverTrigger>
                {triggerComponent}
            </PopoverTrigger>
            <Portal>
                <PopoverContent width="fit-content" minWidth={contentMinWidth} pl="1">
                    <PopoverHeader borderBottomWidth={showHeaderBorder ? '1px' : '0px'}>
                        {headerComponent}
                    </PopoverHeader>
                    <PopoverBody py="0">
                        {bodyComponent}
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    </>)
}

export default PopoverTooltip