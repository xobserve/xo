// Copyright 2023 xObserve.io Team

import { Box } from '@chakra-ui/react'
import { MarkdownRender } from 'src/components/markdown/MarkdownRender'
import { PanelProps } from 'types/dashboard'
import { replaceWithVariables } from 'utils/variable'
import React from 'react'
import { PanelType, TextPanel } from './types'

interface Props extends PanelProps {
  panel: TextPanel
}

const PanelWrapper = (props: Props) => {
  return (
    <Box
      px='2'
      height='100%'
      display='flex'
      alignItems={props.panel.plugins[PanelType].alignItems}
      justifyContent={props.panel.plugins[PanelType].justifyContent}
    >
      <MarkdownRender
        fontSize={props.panel.plugins[PanelType].fontSize}
        fontWeight={props.panel.plugins[PanelType].fontWeight}
        md={replaceWithVariables(props.panel.plugins[PanelType]?.md ?? '')}
        width='100%'
      />
    </Box>
  )
}

export default PanelWrapper
