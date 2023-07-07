// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';

type TProps = Record<string, any> & {
  markerEnd: string;
  pathPoints: [number, number][];
};

const D_CMDS = ['M', 'C'];

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
    const { markerEnd, pathPoints, ...rest } = this.props;
    const d = pathPoints.map((pt, i) => `${D_CMDS[i] || ''}${pt.join(',')}`).join(' ');
    return (
      <path
        d={d}
        fill="none"
        stroke="#000"
        vectorEffect="non-scaling-stroke"
        markerEnd={markerEnd}
        {...rest}
      />
    );
  }
}
