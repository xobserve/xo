// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

type TProps = {
  children: React.ReactNode
  height: number
  width: number
}

export default function EdgesContainer(props: TProps) {
  const { children, height, width, ...rest } = props
  return (
    <svg
      height={height}
      width={width}
      xmlns='http://www.w3.org/2000/svg'
      {...rest}
    >
      {children}
    </svg>
  )
}
