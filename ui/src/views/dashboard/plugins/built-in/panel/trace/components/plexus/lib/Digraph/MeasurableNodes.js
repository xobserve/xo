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
import MeasurableNode from './MeasurableNode';
import { isSamePropSetter } from './utils';
export default class MeasurableNodes extends React.Component {
  shouldComponentUpdate(np) {
    const p = this.props;
    return p.renderNode !== np.renderNode || p.getClassName !== np.getClassName || p.layerType !== np.layerType || p.layoutVertices !== np.layoutVertices || p.nodeRefs !== np.nodeRefs || p.renderUtils !== np.renderUtils || p.vertices !== np.vertices || !isSamePropSetter(p.setOnNode, np.setOnNode);
  }
  render() {
    const {
      getClassName,
      nodeRefs,
      layoutVertices,
      renderUtils,
      vertices,
      layerType,
      renderNode,
      setOnNode
    } = this.props;
    return vertices.map((vertex, i) => /*#__PURE__*/React.createElement(MeasurableNode, {
      key: vertex.key,
      getClassName: getClassName,
      ref: nodeRefs[i],
      hidden: !layoutVertices,
      layerType: layerType,
      renderNode: renderNode,
      renderUtils: renderUtils,
      vertex: vertex,
      layoutVertex: layoutVertices && layoutVertices[i],
      setOnNode: setOnNode
    }));
  }
}