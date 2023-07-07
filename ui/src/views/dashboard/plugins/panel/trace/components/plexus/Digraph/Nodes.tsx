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

import Node from './Node';
import { TLayerType, TNodeRenderer, TRendererUtils } from './types';
import { TLayoutVertex } from '../types';
import { isSamePropSetter } from './utils';

type TProps<T = {}> = TNodeRenderer<T> & {
  getClassName: (name: string) => string;
  layerType: TLayerType;
  layoutVertices: TLayoutVertex<T>[];
  renderNode: NonNullable<TNodeRenderer<T>['renderNode']>;
  renderUtils: TRendererUtils;
};

export default class Nodes<T = {}> extends React.Component<TProps<T>> {
  shouldComponentUpdate(np: TProps<T>) {
    const p = this.props;
    return (
      p.renderNode !== np.renderNode ||
      p.getClassName !== np.getClassName ||
      p.layerType !== np.layerType ||
      p.layoutVertices !== np.layoutVertices ||
      p.renderUtils !== np.renderUtils ||
      !isSamePropSetter(p.setOnNode, np.setOnNode)
    );
  }

  render() {
    const { getClassName, layoutVertices, renderUtils, layerType, renderNode, setOnNode } = this.props;
    return layoutVertices.map(lv => (
      <Node
        key={lv.vertex.key}
        getClassName={getClassName}
        layerType={layerType}
        layoutVertex={lv}
        renderNode={renderNode}
        renderUtils={renderUtils}
        setOnNode={setOnNode}
      />
    ));
  }
}
