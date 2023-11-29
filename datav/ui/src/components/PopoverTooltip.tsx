// Copyright 2023 xObserve.io Team

import { Box } from '@chakra-ui/layout'
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/popover'
import { PlacementWithLogical } from '@chakra-ui/popper'
import { Portal } from '@chakra-ui/portal'
import React from 'react'

interface Props {
  trigger?: 'hover' | 'click'
  triggerComponent: React.ReactNode
  offset?: [number, number]
  showHeaderBorder?: boolean
  headerComponent: React.ReactNode
  bodyComponent?: React.ReactNode
  contentMinWidth?: string
  placement?: PlacementWithLogical
}
const PopoverTooltip = (props: Props) => {
  const {
    trigger = 'hover',
    triggerComponent,
    offset = null,
    showHeaderBorder = false,
    headerComponent,
    bodyComponent = null,
    contentMinWidth = '120px',
    placement = 'right-start',
  } = props
  return (
    <>
      <Popover
        trigger={trigger}
        placement={placement}
        offset={offset}
        openDelay={100}
        closeDelay={100}
      >
        <PopoverTrigger>{triggerComponent}</PopoverTrigger>
        <Portal>
          <PopoverContent width='fit-content' minWidth={contentMinWidth} pl='1'>
            <PopoverHeader borderBottomWidth={showHeaderBorder ? '1px' : '0px'}>
              {headerComponent}
            </PopoverHeader>
            <PopoverBody py='0'>{bodyComponent}</PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  )
}

export default PopoverTooltip
