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

import { TMeasurableNodeRenderer, TLayerType, TRendererUtils, ELayerType } from './types';
import { assignMergeCss, getProps } from './utils';
import { TLayoutVertex, TVertex } from '../types';

type TProps<T = {}> = Omit<TMeasurableNodeRenderer<T>, 'measurable' | 'measureNode'> & {
  getClassName: (name: string) => string;
  hidden: boolean;
  layerType: TLayerType;
  layoutVertex: TLayoutVertex<T> | null;
  renderUtils: TRendererUtils;
  vertex: TVertex<T>;
};

const SVG_HIDDEN_STYLE = { visibility: 'hidden' };

export default class MeasurableNode<T = {}> extends React.PureComponent<TProps<T>> {
  htmlRef: React.RefObject<HTMLDivElement> = React.createRef();
  svgRef: React.RefObject<SVGGElement> = React.createRef();

  private measureHtml() {
    const { current } = this.htmlRef;
    if (!current) {
      return { height: 0, width: 0 };
    }
    return {
      height: current.offsetHeight,
      width: current.offsetWidth,
    };
  }

  private measureSvg() {
    const { current } = this.svgRef;
    if (!current) {
      return { height: 0, width: 0 };
    }
    const { height, width } = current.getBBox();
    return { height, width };
  }

  private renderHtml() {
    const { getClassName, hidden, renderNode, renderUtils, setOnNode, vertex, layoutVertex } = this.props;
    const { height = null, left = null, top = null, width = null } = layoutVertex || {};
    const props = assignMergeCss(
      {
        className: getClassName('MeasurableHtmlNode'),
        style: {
          height,
          width,
          boxSizing: 'border-box',
          position: 'absolute',
          transform:
            left == null || top == null ? undefined : `translate(${left.toFixed()}px,${top.toFixed()}px)`,
          visibility: hidden ? 'hidden' : undefined,
        },
      },
      getProps(setOnNode, vertex, renderUtils, layoutVertex)
    );
    return (
      <div ref={this.htmlRef} {...props}>
        {renderNode(vertex, renderUtils, layoutVertex)}
      </div>
    );
  }

  private renderSvg() {
    const { getClassName, hidden, renderNode, renderUtils, setOnNode, vertex, layoutVertex } = this.props;
    const { left = null, top = null } = layoutVertex || {};
    const props = assignMergeCss(
      {
        className: getClassName('MeasurableSvgNode'),
        transform: left == null || top == null ? undefined : `translate(${left.toFixed()}, ${top.toFixed()})`,
        style: hidden ? SVG_HIDDEN_STYLE : null,
      },
      getProps(setOnNode, vertex, renderUtils, layoutVertex)
    );
    return (
      <g ref={this.svgRef} {...props}>
        {renderNode(vertex, renderUtils, layoutVertex)}
      </g>
    );
  }

  getRef() {
    if (this.props.layerType === ELayerType.Html) {
      return { htmlWrapper: this.htmlRef.current, svgWrapper: undefined };
    }
    return { svgWrapper: this.svgRef.current, htmlWrapper: undefined };
  }

  measure() {
    return this.props.layerType === ELayerType.Html ? this.measureHtml() : this.measureSvg();
  }

  render() {
    const { layerType } = this.props;
    if (layerType === ELayerType.Html) {
      return this.renderHtml();
    }
    return this.renderSvg();
  }
}
