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

import { TSetOnContainer, TExposedGraphState } from './types';
import { assignMergeCss, getProps } from './utils';
import ZoomManager from '../zoom/ZoomManager';

type TProps<T = {}, U = {}> = Record<string, unknown> &
  TSetOnContainer<T, U> & {
    classNamePart: string;
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
    standalone?: boolean;
    topLayer?: boolean;
  };

const STYLE: React.CSSProperties = { left: 0, position: 'absolute', top: 0 };

export default class HtmlLayer<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
  render() {
    const { children, classNamePart, getClassName, graphState, setOnContainer, standalone, topLayer } =
      this.props;
    const { zoomTransform } = graphState;
    const zoomStyle = { style: topLayer || standalone ? ZoomManager.getZoomStyle(zoomTransform) : {} };
    const containerProps = assignMergeCss(
      {
        className: getClassName(classNamePart),
        style: STYLE,
      },
      zoomStyle,
      getProps(setOnContainer, graphState)
    );
    return <div {...containerProps}>{children}</div>;
  }
}
