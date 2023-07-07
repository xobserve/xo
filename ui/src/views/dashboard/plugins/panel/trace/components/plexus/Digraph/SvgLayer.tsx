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

import SvgDefEntry from './SvgDefEntry';
import { TSetOnContainer, TExposedGraphState, TDefEntry } from './types';
import { assignMergeCss, getProps } from './utils';
import TNonEmptyArray from '../types/TNonEmptyArray';
import ZoomManager from '../zoom/ZoomManager';

type TProps<T = {}, U = {}> = Record<string, unknown> &
  TSetOnContainer<T, U> & {
    classNamePart: string;
    getClassName: (name: string) => string;
    defs?: TNonEmptyArray<TDefEntry<T, U>>;
    extraWrapper?: Record<string, unknown>;
    graphState: TExposedGraphState<T, U>;
    standalone?: boolean;
    topLayer?: boolean;
  };

const STYLE: React.CSSProperties = {
  left: 0,
  minHeight: '100%',
  minWidth: '100%',
  position: 'absolute',
  top: 0,
};

export default class SvgLayer<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
  render() {
    const {
      children,
      classNamePart,
      getClassName,
      defs,
      extraWrapper,
      graphState,
      setOnContainer,
      standalone,
      topLayer,
    } = this.props;

    const containerProps = assignMergeCss(
      {
        className: getClassName(classNamePart),
      },
      getProps(setOnContainer, graphState)
    );
    let content = (
      <g {...containerProps}>
        {defs && (
          <defs>
            {defs.map(defEntry => (
              <SvgDefEntry<T, U>
                key={defEntry.localId}
                {...defEntry}
                getClassName={getClassName}
                graphState={graphState}
              />
            ))}
          </defs>
        )}
        {children}
      </g>
    );
    if (extraWrapper) {
      content = <g {...extraWrapper}>{content}</g>;
    }

    if (!standalone && !topLayer) {
      return content;
    }

    const { zoomTransform } = graphState;
    return (
      <svg className={getClassName('SvgLayer')} style={STYLE}>
        <g
          className={getClassName('SvgLayer--transformer')}
          transform={ZoomManager.getZoomAttr(zoomTransform)}
        >
          {content}
        </g>
      </svg>
    );
  }
}
