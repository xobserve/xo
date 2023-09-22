// Copyright (c) 2020 The Jaeger Authors.
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

import { ITableSpan } from './types';

export default function generateColor(tableValue: ITableSpan[], attribute: string, colorToPercent: boolean) {
  let color;
  let colorString;
  const tableValue2 = tableValue;

  for (let i = 0; i < tableValue2.length; i++) {
    if (colorToPercent) {
      if (attribute === 'percent') {
        color = 236 - 166 * (tableValue2[i].percent / 100);
        colorString = `rgb(248,${color},${color})`;

        tableValue2[i].colorToPercent = colorString;
      } else {
        let max = 0;
        // find hights value
        for (let j = 0; j < tableValue2.length; j++) {
          if (max < (tableValue2[j] as any)[attribute]) {
            max = (tableValue2[j] as any)[attribute];
          }
        }
        const onePercent = 100 / max / 100;
        color = 236 - 166 * ((tableValue2[i] as any)[attribute] * onePercent);
        colorString = `rgb(248,${color},${color})`;

        tableValue2[i].colorToPercent = colorString;
      }
    } else if (tableValue2[i].isDetail) {
      tableValue2[i].colorToPercent = `rgb(248,248,248)`;
    } else {
      tableValue2[i].colorToPercent = 'transparent';
    }
  }
  return tableValue2;
}
