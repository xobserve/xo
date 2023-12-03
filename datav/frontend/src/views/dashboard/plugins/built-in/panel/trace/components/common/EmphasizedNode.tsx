// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import './EmphasizedNode.css'

type Props = {
  height: number
  width: number
}

const EmphasizedNode = ({ height, width }: Props) => {
  return (
    <>
      <rect
        className='EmphasizedNode--contrast is-non-scaling'
        vectorEffect='non-scaling-stroke'
        width={width}
        height={height}
      />
      <rect
        className='EmphasizedNode--contrast is-scaling'
        width={width}
        height={height}
      />
      <rect
        className='EmphasizedNode is-non-scaling'
        vectorEffect='non-scaling-stroke'
        width={width}
        height={height}
      />
      <rect
        className='EmphasizedNode is-scaling'
        width={width}
        height={height}
      />
    </>
  )
}

export default EmphasizedNode

// const cssStyles = {
//     '.EmphasizedNode': {
//         stroke: '#fff3d7'
//       },

//       '.EmphasizedNode.is-non-scaling' :{
//         'stroke-width': '10'
//       },

//       '.EmphasizedNode.is-scaling': {
//         'stroke-width': '34'
//       },

//       '.EmphasizedNode--contrast': {
//         stroke: 'rgba(0, 0, 0, 0.07)'
//       },

//       '.EmphasizedNode--contrast.is-non-scaling': {
//         'stroke-width': '12'
//       },

//       '.EmphasizedNode--contrast.is-scaling': {
//         'stroke-width': '36'
//       }
// }
