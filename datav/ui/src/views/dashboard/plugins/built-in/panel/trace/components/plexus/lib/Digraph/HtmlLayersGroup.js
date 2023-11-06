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
import HtmlLayer from './HtmlLayer';
import MeasurableNodesLayer from './MeasurableNodesLayer';
import NodesLayer from './NodesLayer';
import { ELayerType } from './types';
export default class HtmlLayersGroup extends React.PureComponent {
  renderLayers() {
    const {
      getClassName,
      layers,
      graphState,
      setSizeVertices
    } = this.props;
    return layers.map(layer => {
      const {
        key,
        setOnContainer
      } = layer;
      if (layer.measurable) {
        const {
          renderNode,
          setOnNode
        } = layer;
        return /*#__PURE__*/React.createElement(MeasurableNodesLayer, {
          key: key,
          getClassName: getClassName,
          graphState: graphState,
          layerType: ELayerType.Html,
          renderNode: renderNode,
          senderKey: key,
          setOnContainer: setOnContainer,
          setOnNode: setOnNode,
          setSizeVertices: setSizeVertices
        });
      }
      if (layer.renderNode) {
        const {
          renderNode,
          setOnNode
        } = layer;
        return /*#__PURE__*/React.createElement(NodesLayer, {
          key: key,
          getClassName: getClassName,
          graphState: graphState,
          layerType: ELayerType.Html,
          renderNode: renderNode,
          setOnContainer: setOnContainer,
          setOnNode: setOnNode
        });
      }
      // html edges layer
      throw new Error('Not implemented');
    });
  }
  render() {
    return /*#__PURE__*/React.createElement(HtmlLayer, Object.assign({
      topLayer: true,
      classNamePart: "HtmlLayersGroup"
    }, this.props), this.renderLayers());
  }
}