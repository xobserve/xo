// Copyright (c) 2017 Uber Technologies, Inc.
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

import resetZoomIcon from './resetZoomIcon';

/* eslint-disable react/no-unused-prop-types */
type TProps = {
  classNamePrefix?: string | void;
  className?: string | void;
  contentHeight: number;
  contentWidth: number;
  viewAll: () => void;
  viewportHeight: number;
  viewportWidth: number;
  k?: number;
  x?: number;
  y?: number;
};
/* eslint-enable react/no-unused-prop-types */

const LENGTH_TARGET_PX = 80;

function getMapSize(props: TProps) {
  const { contentHeight: ch, contentWidth: cw } = props;
  if (ch > cw) {
    return { height: LENGTH_TARGET_PX, width: (LENGTH_TARGET_PX * cw) / ch };
  }
  return { height: (LENGTH_TARGET_PX * ch) / cw, width: LENGTH_TARGET_PX };
}

function getViewTransform(props: TProps, displaySize: { width: number; height: number }) {
  const {
    contentHeight: ch,
    contentWidth: cw,
    viewportHeight: vh,
    viewportWidth: vw,
    k = 1,
    x = 1,
    y = 1,
  } = props;
  const { height: dh, width: dw } = displaySize;
  const sch = ch * k;
  const scw = cw * k;
  const left = Math.max(-x / scw, 0);
  const right = Math.min((-x + vw) / scw, 1);
  const top = Math.max(-y / sch, 0);
  const bottom = Math.min((-y + vh) / sch, 1);
  return {
    transform: `
      translate(${(left * dw).toFixed(2)}px, ${(top * dh).toFixed(2)}px)
      scale(${right - left}, ${bottom - top})
    `,
    transformOrigin: '0 0',
  };
}

function getClassNames(props: TProps) {
  const { className, classNamePrefix } = props;
  const base = `${classNamePrefix || 'plexus'}-MiniMap`;
  return {
    root: `${base} ${className || ''}`,
    item: `${base}--item`,
    map: `${base}--map`,
    mapActive: `${base}--mapActive`,
    button: `${base}--button`,
  };
}

export function MiniMap(props: TProps) {
  const css = getClassNames(props);
  const mapSize = getMapSize(props);
  const activeXform = getViewTransform(props, mapSize);
  return (
    <div className={css.root}>
      <div className={`${css.item} ${css.map}`} style={mapSize}>
        <div className={css.mapActive} style={{ ...activeXform, ...mapSize }} />
      </div>
      <div className={`${css.item} ${css.button}`} onClick={props.viewAll} role="button">
        {resetZoomIcon}
      </div>
    </div>
  );
}

MiniMap.defaultProps = {
  className: '',
  classNamePrefix: 'plexus',
};

export default React.memo(MiniMap);
