// Copyright (c) 2022 The Jaeger Authors.
//

import React, { memo } from 'react'
import {
  FlamegraphRenderer,
  convertJaegerTraceToProfile,
} from '@pyroscope/flamegraph'
import { Trace } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'
import { Box, useColorMode } from '@chakra-ui/react'
import { cloneDeep } from 'lodash'
import '@pyroscope/flamegraph/dist/index.css'

interface Props {
  trace: Trace
}
const TraceFlamegraph = memo(({ trace }: Props) => {
  const convertedProfile = convertJaegerTraceToProfile(cloneDeep(trace))
  const { colorMode } = useColorMode()
  return (
    <Box
      className='Flamegraph-wrapper'
      padding='2px calc(1rem - 5px)'
      sx={{
        'input[type=search]': {
          background: 'transparent',
          color: colorMode === 'light' ? 'black' : '#fff !important',
        },
        '.rc-menu-button': {
          background: 'transparent',
        },
        // "button[disabled]": {
        //     backgroundColor:  colorMode == "light" ?  customColors.bodyBg.light : customColors.bodyBg.dark,
        // }
      }}
    >
      <FlamegraphRenderer colorMode={colorMode} profile={convertedProfile} />
    </Box>
  )
})

export default TraceFlamegraph
