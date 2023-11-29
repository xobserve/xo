// Copyright 2023 xObserve.io Team

import { Box } from '@chakra-ui/react'
import { PanelProps } from 'types/dashboard'
import React from 'react'
import { TracePanel } from './types'

interface Props extends PanelProps {
  panel: TracePanel
}

const PanelWrapper = (props: Props) => {
  return <Box></Box>
}

export default PanelWrapper
