// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'

import { Box, HStack, Tooltip } from '@chakra-ui/react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import {
  AiOutlineDoubleRight,
  AiOutlineDown,
  AiOutlineRight,
} from 'react-icons/ai'

type CollapserProps = {
  onCollapseAll: () => void
  onCollapseOne: () => void
  onExpandOne: () => void
  onExpandAll: () => void
}

const TimelineCollapser = ({
  onExpandAll,
  onExpandOne,
  onCollapseAll,
  onCollapseOne,
}: CollapserProps) => {
  return (
    <HStack spacing='6px'>
      <Tooltip label='Expand +1'>
        <Box>
          <AiOutlineDown cursor='pointer' onClick={onExpandOne} />
        </Box>
      </Tooltip>
      <Tooltip label='Collapse +1'>
        <Box>
          <AiOutlineRight cursor='pointer' onClick={onCollapseOne} />
        </Box>
      </Tooltip>
      <Tooltip label='Expand All'>
        <Box>
          <AiOutlineDoubleRight
            cursor='pointer'
            style={{
              transform: 'rotate(90deg)',
            }}
            onClick={onExpandAll}
          />
        </Box>
      </Tooltip>
      <Tooltip label='Collapse All'>
        <Box>
          <AiOutlineDoubleRight
            cursor='pointer'
            onClick={onCollapseAll}
            className='TimelineCollapser--btn'
          />
        </Box>
      </Tooltip>
    </HStack>
  )
}

export default TimelineCollapser
