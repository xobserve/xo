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
import memoizeOne from 'memoize-one';
import { assignMergeCss, getProps } from './utils';
function makeIriRef(renderUtils, localId) {
  return localId ? `url(#${renderUtils.getGlobalId(localId)})` : localId;
}
const PATH_D_CMDS = ['M', 'C'];
function makePathD(points) {
  const dArr = [];
  const cmdLen = PATH_D_CMDS.length;
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (i < cmdLen) {
      dArr.push(PATH_D_CMDS[i]);
    }
    dArr.push(pt[0], pt[1]);
  }
  return dArr.join(' ');
}
export default class SvgEdge extends React.PureComponent {
  constructor() {
    super(...arguments);
    this.makePathD = memoizeOne(makePathD);
  }
  render() {
    const {
      getClassName,
      layoutEdge,
      markerEndId,
      markerStartId,
      renderUtils,
      setOnEdge
    } = this.props;
    const {
      pathPoints
    } = layoutEdge;
    const d = makePathD(pathPoints);
    const markerEnd = makeIriRef(renderUtils, markerEndId);
    const markerStart = makeIriRef(renderUtils, markerStartId);
    const customProps = assignMergeCss({
      className: getClassName('SvgEdge')
    }, getProps(setOnEdge, layoutEdge, renderUtils));
    return /*#__PURE__*/React.createElement("path", Object.assign({
      d: d,
      fill: "none",
      vectorEffect: "non-scaling-stroke",
      markerEnd: markerEnd,
      markerStart: markerStart
    }, customProps));
  }
}