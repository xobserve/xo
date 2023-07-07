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

import { zoomIdentity, ZoomTransform } from 'd3-zoom';

const SCALE_MAX = 1;
const SCALE_MIN = 0.03;
const SCALE_MARGIN = 0.05;

const DEFAULT_ZOOM_STYLE = Object.freeze({
  transform: `translate(0px, 0px) scale(1)`,
  transformOrigin: '0 0',
});

export const DEFAULT_SCALE_EXTENT: [typeof SCALE_MIN, typeof SCALE_MAX] = [SCALE_MIN, SCALE_MAX];

function boundValue(min: number, max: number, value: number) {
  if (value < min) {
    return min;
  }
  return value > max ? max : value;
}

function getFittedScale(width: number, height: number, viewWidth: number, viewHeight: number) {
  return Math.max(
    SCALE_MIN,
    Math.min(((1 - SCALE_MARGIN) * viewWidth) / width, ((1 - SCALE_MARGIN) * viewHeight) / height, SCALE_MAX)
  );
}

export function getScaleExtent(
  width: number,
  height: number,
  viewWidth: number,
  viewHeight: number
): [number, number] {
  const scaleMin = getFittedScale(width, height, viewWidth, viewHeight);
  return [scaleMin, SCALE_MAX];
}

export function fitWithinContainer(width: number, height: number, viewWidth: number, viewHeight: number) {
  const scale = getFittedScale(width, height, viewWidth, viewHeight);
  const scaledHeight = scale * height;
  const scaledWidth = scale * width;
  const x = (viewWidth - scaledWidth) / 2;
  const y = (viewHeight - scaledHeight) / 2;
  return zoomIdentity.translate(x, y).scale(scale);
}

export function constrainZoom(
  transform: ZoomTransform,
  width: number,
  height: number,
  viewWidth: number,
  viewHeight: number
) {
  const { k: tk, x: tx, y: ty } = transform;
  const fittedScale = getFittedScale(width, height, viewWidth, viewHeight);
  const k = Math.max(tk, fittedScale);
  const x = boundValue(-width * k + viewWidth * 0.5, viewWidth * 0.5, tx);
  const y = boundValue(-height * k + viewHeight * 0.5, viewHeight * 0.5, ty);
  if (k !== tk || x !== tx || y !== ty) {
    return zoomIdentity.translate(x, y).scale(k);
  }
  return transform;
}

export function getZoomStyle(transform: ZoomTransform | void): React.CSSProperties {
  if (transform == null) {
    return DEFAULT_ZOOM_STYLE;
  }
  const { x, y, k } = transform;
  const rv: React.CSSProperties = {
    transform: `translate(${x.toFixed()}px, ${y.toFixed()}px) scale(${k})`,
    transformOrigin: '0 0',
  };
  return rv;
}

export function getZoomAttr(transform: ZoomTransform | void) {
  if (!transform) {
    return undefined;
  }
  const { x, y, k } = transform;
  return `translate(${x.toFixed()},${y.toFixed()}) scale(${k})`;
}
