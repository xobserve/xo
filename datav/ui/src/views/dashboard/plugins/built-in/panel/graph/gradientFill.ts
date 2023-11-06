// Copyright 2023 observex.io Team
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

import { getCanvasContext } from "utils/measureText";

export function getDataRange(plot: uPlot, scaleKey: string) {
    let sc = plot.scales[scaleKey];
  
    let min = Infinity;
    let max = -Infinity;
  
    plot.series.forEach((ser, seriesIdx) => {
      if (ser.show && ser.scale === scaleKey) {
        // uPlot skips finding data min/max when a scale has a pre-defined range
        if (ser.min == null) {
          let data = plot.data[seriesIdx];
          for (let i = 0; i < data.length; i++) {
            if (data[i] != null) {
              min = Math.min(min, data[i]!);
              max = Math.max(max, data[i]!);
            }
          }
        } else {
          min = Math.min(min, ser.min!);
          max = Math.max(max, ser.max!);
        }
      }
    });
  
    if (max === min) {
      min = sc.min!;
      max = sc.max!;
    }
  
    return [min, max];
  }

export function getGradientRange(
    u: uPlot,
    scaleKey: string,
    hardMin?: number | null,
    hardMax?: number | null,
    softMin?: number | null,
    softMax?: number | null
  ) {
    let min = hardMin ?? softMin ?? null;
    let max = hardMax ?? softMax ?? null;
  
    if (min == null || max == null) {
      let [dataMin, dataMax] = getDataRange(u, scaleKey);
  
      min = min ?? dataMin ?? 0;
      max = max ?? dataMax ?? 100;
    }
  
    return [min, max];
  }

  type ValueStop = [value: number, color: string];

  type ScaleValueStops = ValueStop[];
  export enum ScaleOrientation {
    Horizontal = 0,
    Vertical = 1,
  }
  
  export function scaleGradient(u: uPlot, scaleKey: string, scaleStops: ScaleValueStops, discrete = false) {
    let scale = u.scales[scaleKey];
  
    // we want the stop below or at the scaleMax
    // and the stop below or at the scaleMin, else the stop above scaleMin
    let minStopIdx: number | null = null;
    let maxStopIdx: number | null = null;
  
    for (let i = 0; i < scaleStops.length; i++) {
      let stopVal = scaleStops[i][0];
  
      if (stopVal <= scale.min! || minStopIdx == null) {
        minStopIdx = i;
      }
  
      maxStopIdx = i;
  
      if (stopVal >= scale.max!) {
        break;
      }
    }
  
    if (minStopIdx === maxStopIdx) {
      return scaleStops[minStopIdx!][1];
    }
  
    let minStopVal = scaleStops[minStopIdx!][0];
    let maxStopVal = scaleStops[maxStopIdx!][0];
  
    if (minStopVal === -Infinity) {
      minStopVal = scale.min!;
    }
  
    if (maxStopVal === Infinity) {
      maxStopVal = scale.max!;
    }
  
    let minStopPos = Math.round(u.valToPos(minStopVal, scaleKey, true));
    let maxStopPos = Math.round(u.valToPos(maxStopVal, scaleKey, true));
  
    let range = minStopPos - maxStopPos;
  
    if (range === 0) {
      return scaleStops[maxStopIdx!][1];
    }
  
    let x0, y0, x1, y1;
  
    if (u.scales.x!.ori === ScaleOrientation.Horizontal) {
      x0 = x1 = 0;
      y0 = minStopPos;
      y1 = maxStopPos;
    } else {
      y0 = y1 = 0;
      x0 = minStopPos;
      x1 = maxStopPos;
    }
  
    let ctx = getCanvasContext();
  
    let grd = ctx.createLinearGradient(x0, y0, x1, y1);
  
    let prevColor: string;
  
    for (let i = minStopIdx!; i <= maxStopIdx!; i++) {
      let s = scaleStops[i];
  
      let stopPos =
        i === minStopIdx ? minStopPos : i === maxStopIdx ? maxStopPos : Math.round(u.valToPos(s[0], scaleKey, true));
  
      let pct = (minStopPos - stopPos) / range;
  
      if (discrete && i > minStopIdx!) {
        grd.addColorStop(pct, prevColor!);
      }
  
      grd.addColorStop(pct, (prevColor = s[1]));
    }
  
    return grd;
  }