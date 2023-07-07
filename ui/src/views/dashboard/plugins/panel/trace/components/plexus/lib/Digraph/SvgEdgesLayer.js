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
import SvgEdges from './SvgEdges';
import SvgLayer from './SvgLayer';
// Add the default black stroke on an outter <g> so CSS classes or styles
// on the inner <g> can override it
// TODO: A more configurable appraoch to setting a default stroke color
const INHERIT_STROKE = {
  stroke: '#000'
};
export default class SvgEdgesLayer extends React.PureComponent {
  render() {
    const {
      getClassName,
      graphState,
      markerEndId,
      markerStartId,
      setOnEdge
    } = this.props;
    const {
      layoutEdges,
      renderUtils
    } = graphState;
    if (!layoutEdges) {
      return null;
    }
    return /*#__PURE__*/React.createElement(SvgLayer, Object.assign({}, this.props, {
      classNamePart: "SvgEdgesLayer",
      extraWrapper: INHERIT_STROKE
    }), /*#__PURE__*/React.createElement(SvgEdges, {
      getClassName: getClassName,
      layoutEdges: layoutEdges,
      markerEndId: markerEndId,
      markerStartId: markerStartId,
      renderUtils: renderUtils,
      setOnEdge: setOnEdge
    }));
  }
}