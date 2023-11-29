// Copyright (c) 2019 The Jaeger Authors.
//

import React from 'react'
import { SpanReference } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'
import { getUrl } from './url'

type ReferenceLinkProps = {
  reference: SpanReference
  children: React.ReactNode
  className?: string
  focusSpan: (spanID: string) => void
  onClick?: () => void
}

export default function ReferenceLink(props: ReferenceLinkProps) {
  const { reference, children, className, focusSpan, ...otherProps } = props
  delete otherProps.onClick
  if (reference.span) {
    return (
      <a
        role='button'
        onClick={() => focusSpan(reference.spanID)}
        className={className}
        {...otherProps}
      >
        {children}
      </a>
    )
  }
  return (
    <a
      href={getUrl(reference.traceID, reference.spanID)}
      target='_blank'
      rel='noopener noreferrer'
      className={className}
      {...otherProps}
    >
      {children}
    </a>
  )
}
