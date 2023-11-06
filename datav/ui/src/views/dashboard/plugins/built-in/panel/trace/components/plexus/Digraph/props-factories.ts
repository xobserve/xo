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

import { TExposedGraphState } from './types';
import { getValueScaler } from './utils';

export const classNameIsSmall = (() => {
  // define via an IIFE to sequester consts
  const SCALE_THRESHOLD_SMALL = 0.29;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function classNameIsSmall<T = {}, U = {}>(graphState: TExposedGraphState<T, U>) {
    const { k = 1 } = graphState.zoomTransform || {};
    if (k <= SCALE_THRESHOLD_SMALL) {
      return { className: 'is-small' };
    }
    return null;
  }

  return classNameIsSmall;
})();

export const scaleProperty = (() => {
  // define via an IIFE to sequester consts
  const MAX = 1;
  const MIN = 0.3;
  const EXP_ADJUSTER = 0.5;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function scaleProperty(
    property: keyof React.CSSProperties,
    valueMin: number = MIN,
    valueMax: number = MAX,
    expAdjuster: number = EXP_ADJUSTER
  ) {
    const defaultStyle = { style: { [property]: valueMax } };
    const fnName = `scale_${property}`;
    const valueScaler = getValueScaler({ valueMax, valueMin, expAdjuster });
    const o = {
      [fnName](graphState: TExposedGraphState<any, any>) {
        const { zoomTransform } = graphState;
        if (!zoomTransform) {
          return defaultStyle;
        }
        const value = valueScaler(zoomTransform.k);
        return { style: { [property]: value } };
      },
    };
    return o[fnName];
  }

  scaleProperty.opacity = scaleProperty('opacity');
  scaleProperty.strokeOpacity = scaleProperty('strokeOpacity');
  scaleProperty.strokeOpacityStrong = scaleProperty('strokeOpacity', MIN, MAX, 0.75);
  scaleProperty.strokeOpacityStrongest = scaleProperty('strokeOpacity', MIN, MAX, 1);
  return scaleProperty;
})();
