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

import NodesLayer from './NodesLayer';
import SvgEdgesLayer from './SvgEdgesLayer';
import SvgLayer from './SvgLayer';
import { TExposedGraphState, TSvgLayersGroup, ELayerType } from './types';

type TProps<T = {}, U = {}> = Omit<TSvgLayersGroup<T, U>, 'layerType' | 'key'> & {
  getClassName: (name: string) => string;
  graphState: TExposedGraphState<T, U>;
};

export default class SvgLayersGroup<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
  private renderLayers() {
    const { getClassName, layers, graphState } = this.props;
    return layers.map(layer => {
      const { key, setOnContainer } = layer;
      if (layer.edges) {
        return (
          <SvgEdgesLayer<T, U>
            key={key}
            getClassName={getClassName}
            graphState={graphState}
            markerEndId={layer.markerEndId}
            markerStartId={layer.markerStartId}
            setOnContainer={setOnContainer}
            setOnEdge={layer.setOnEdge}
          />
        );
      }
      if (layer.measurable) {
        // meassurable nodes layer
        throw new Error('Not implemented');
      }
      return (
        <NodesLayer<T, U>
          key={key}
          getClassName={getClassName}
          graphState={graphState}
          layerType={ELayerType.Svg}
          renderNode={layer.renderNode}
          setOnContainer={setOnContainer}
          setOnNode={layer.setOnNode}
        />
      );
    });
  }

  render() {
    return (
      <SvgLayer topLayer {...this.props} classNamePart="SvgLayersGroup">
        {this.renderLayers()}
      </SvgLayer>
    );
  }
}
