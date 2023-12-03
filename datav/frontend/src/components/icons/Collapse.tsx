// Copyright 2023 xObserve.io Team

import { Box } from '@chakra-ui/react'
import { FaChevronRight } from 'react-icons/fa'
import React from 'react'

const CollapseIcon = ({
  collapsed,
  onClick = null,
  collapsedDir = '0deg',
  expandedDir = '90deg',
  ...rest
}) => {
  return (
    <Box
      cursor='pointer'
      onClick={onClick}
      transition={'transform 0.15s ease-out;'}
      transform={
        collapsed ? `rotate(${collapsedDir})` : `rotate(${expandedDir})`
      }
      {...rest}
    >
      <FaChevronRight />
    </Box>
  )
}

export default CollapseIcon
