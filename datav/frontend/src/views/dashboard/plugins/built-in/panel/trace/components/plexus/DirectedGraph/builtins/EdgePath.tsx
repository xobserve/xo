// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

type TProps = Record<string, any> & {
  markerEnd: string
  pathPoints: [number, number][]
}

const D_CMDS = ['M', 'C']

// const strokeDefId = 'pathStroke';
// const strokeReference = `url(#${strokeDefId})`;

// export function EdgePathStrokeDef(props) {
//   const strokeDef = (
//     <linearGradient id={strokeDefId}>
//       <stop offset="0%" stopColor="#00c" />
//       <stop offset="7%" stopColor="#00c" />
//       <stop offset="93%" stopColor="#0c0" />
//       <stop offset="100%" stopColor="#0c0" />
//     </linearGradient>
//   );
//   return props.enclose ? <defs>{strokeDef}</defs> : strokeDef;
// }

// NOTE: This function is necessary for gradient stroke
// function renderPathPoint(pt, i) {
//   let [x, y] = pt;
//   if (i === 0) {
//     // add a small amount of jitter (1% of a pixel) to avert an issue with
//     // bounding-box based linear gradients
//     // https://stackoverflow.com/q/13223636/1888292
//     y += 0.01;
//   }
//   return `${D_CMDS[i] || ''}${x},${y}`;
// }

export default class EdgePath extends React.PureComponent<TProps> {
  render() {
    const { markerEnd, pathPoints, ...rest } = this.props
    const d = pathPoints
      .map((pt, i) => `${D_CMDS[i] || ''}${pt.join(',')}`)
      .join(' ')
    return (
      <path
        d={d}
        fill='none'
        stroke='#000'
        vectorEffect='non-scaling-stroke'
        markerEnd={markerEnd}
        {...rest}
      />
    )
  }
}
