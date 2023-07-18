// Copyright 2023 Datav.io Team
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

/**
 * Round half away from zero ('commercial' rounding)
 * Uses correction to offset floating-point inaccuracies.
 * Works symmetrically for positive and negative numbers.
 *
 * ref: https://stackoverflow.com/a/48764436
 */
export function roundDecimals(val: number, dec = 0) {
    if (Number.isInteger(val)) {
      return val;
    }
  
    let p = 10 ** dec;
    let n = val * p * (1 + Number.EPSILON);
    return Math.round(n) / p;
  }
  
  /**
   * Tries to guess number of decimals needed to format a number
   *
   * used for determining minimum decimals required to uniformly
   * format a numric sequence, e.g. 10, 10.125, 10.25, 10.5
   *
   * good for precisce increments:  0.125            -> 3
   * bad  for arbitrary floats:     371.499999999999 -> 12
   */
  export function guessDecimals(num: number) {
    return (('' + num).split('.')[1] || '').length;
  }
  