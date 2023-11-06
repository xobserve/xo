// Copyright 2023 xObserve.io Team
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
import G6 from "@antv/g6";
import { upperFirst } from "lodash";
import { paletteColorNameToHex } from "utils/colors";

export const initLegend = (donutColors) => {
    const legendData = {
        nodes: []
    }

    Object.keys(donutColors).map((key,i) => {

        legendData.nodes.push({
            id: key,
            label: upperFirst(key),
            order: i,
            style: {
                fill: paletteColorNameToHex(donutColors[key]),
            }
        })
    })

    const legend = new G6.Legend({
        data: legendData,
        align: 'center',
        layout: 'horizontal', // vertical
        position: 'bottom-left',
      
        padding: [1, 10, 1, 10],
        containerStyle: {
            fill: 'rgba(255,255,255,0.2)',
            lineWidth: 0,
        },
        title: ' ',
        titleConfig: {
            offsetY: -8,
        },
    });

    return legend
}