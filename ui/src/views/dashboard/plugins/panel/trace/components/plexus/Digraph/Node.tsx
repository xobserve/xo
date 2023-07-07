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

import { TRendererUtils, TLayerType, ELayerType, TRenderNodeFn, TSetProps, TAnyProps } from './types';
import { assignMergeCss, getProps } from './utils';
import { TLayoutVertex } from '../types';

export type TProps<T = {}> = {
  getClassName: (name: string) => string;
  layerType: TLayerType;
  layoutVertex: TLayoutVertex<T>;
  renderNode: TRenderNodeFn<T>;
  renderUtils: TRendererUtils;
  setOnNode?: TSetProps<(layoutVertex: TLayoutVertex<T>, utils: TRendererUtils) => TAnyProps | null>;
};

function getHtmlStyle(lv: TLayoutVertex<any>) {
  const { height, left, top, width } = lv;
  return {
    height,
    width,
    position: 'absolute',
    transform: left == null || top == null ? undefined : `translate(${left.toFixed()}px,${top.toFixed()}px)`,
  };
}

export default class Node<T = {}> extends React.PureComponent<TProps<T>> {
  render() {
    const { getClassName, layerType, renderNode, renderUtils, setOnNode, layoutVertex } = this.props;
    const nodeContent = renderNode(layoutVertex, renderUtils);
    if (!nodeContent) {
      return null;
    }
    const { left, top } = layoutVertex;
    const props = assignMergeCss(
      {
        className: getClassName('Node'),
        style: layerType === ELayerType.Html ? getHtmlStyle(layoutVertex) : null,
        transform: layerType === ELayerType.Svg ? `translate(${left.toFixed()},${top.toFixed()})` : null,
      },
      getProps(setOnNode, layoutVertex, renderUtils)
    );
    const Wrapper = layerType === ELayerType.Html ? 'div' : 'g';
    return <Wrapper {...props}>{nodeContent}</Wrapper>;
  }
}
