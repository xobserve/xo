// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'
export default function EdgesContainer(props) {
  const { children, height, width, ...rest } = props
  return /*#__PURE__*/ React.createElement(
    'svg',
    Object.assign(
      {
        height: height,
        width: width,
        xmlns: 'http://www.w3.org/2000/svg',
      },
      rest,
    ),
    children,
  )
}
