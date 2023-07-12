// Copyright (c) 2019 Uber Technologies, Inc.
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

type Props = {
  height: number;
  width: number;
};

const EmphasizedNode  = ({ height, width }: Props) => {
    return (
      <>
        <rect
          className="EmphasizedNode--contrast is-non-scaling"
          vectorEffect="non-scaling-stroke"
          width={width}
          height={height}
        />
        <rect className="EmphasizedNode--contrast is-scaling" width={width} height={height} />
        <rect
          className="EmphasizedNode is-non-scaling"
          vectorEffect="non-scaling-stroke"
          width={width}
          height={height}
        />
        <rect className="EmphasizedNode is-scaling" width={width} height={height}  />
      </>
    );
}

export default EmphasizedNode;


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