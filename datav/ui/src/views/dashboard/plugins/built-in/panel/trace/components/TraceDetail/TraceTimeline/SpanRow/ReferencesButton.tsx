// Copyright (c) 2019 The Jaeger Authors.
//

import React from 'react'

import { SpanReference } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'

import ReferenceLink from '../../url/ReferenceLink'
import { FaDoorOpen } from 'react-icons/fa'
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

type TReferencesButtonProps = {
  references: SpanReference[]
  children: React.ReactNode
  tooltipText: string
  focusSpan: (spanID: string) => void
}

export default class ReferencesButton extends React.PureComponent<TReferencesButtonProps> {
  render() {
    const { references, children, tooltipText, focusSpan } = this.props

    const tooltipProps = {
      arrowPointAtCenter: true,
      mouseLeaveDelay: 0.5,
      placement: 'bottom',
      title: tooltipText,
      overlayClassName: 'ReferencesButton--tooltip',
    }

    return (
      <Menu>
        <MenuButton as={Button}>{children}</MenuButton>
        <MenuList>
          {references.map((ref) => {
            const { span, spanID } = ref
            return (
              <MenuItem key={`${spanID}`}>
                <ReferenceLink
                  reference={ref}
                  focusSpan={this.props.focusSpan}
                  className='ReferencesButton--TraceRefLink'
                >
                  {span
                    ? `${span.process.serviceName}:${span.operationName} - ${ref.spanID}`
                    : `(another trace) - ${ref.spanID}`}
                  {!span && <FaDoorOpen />}
                </ReferenceLink>
              </MenuItem>
            )
          })}
        </MenuList>
      </Menu>
    )
  }
}
