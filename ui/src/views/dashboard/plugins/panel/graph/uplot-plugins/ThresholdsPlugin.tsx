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
import { useColorMode } from '@chakra-ui/react';
import { alpha } from 'components/uPlot/colorManipulator';
import { cloneDeep, reverse } from 'lodash';
import { useEffect, useLayoutEffect, useState } from 'react';
import tinycolor from 'tinycolor2';
import { Threshold, ThresholdsConfig, ThresholdsMode } from 'types/threshold';
import uPlot from 'uplot';
import { paletteColorNameToHex } from 'utils/colors';
import { getGradientRange, scaleGradient } from '../gradientFill';


interface Props {
    thresholdsConfig: ThresholdsConfig
    options: uPlot.Options;
}

export const ThresholdsPlugin = ({ thresholdsConfig, options }: Props) => {
    const {colorMode} = useColorMode()
    const scaleKey = 'y'
    
    function addAreas(u: uPlot, yScaleKey: string, steps: Threshold[]) {
        let ctx = u.ctx;
    
        let grd = scaleGradient(
          u,
          yScaleKey,
          steps.map((step) => {
            let color = tinycolor(paletteColorNameToHex(step.color, colorMode))
            if (color.getAlpha() === 1) {
                color.setAlpha(0.15);
              }
            // console.log("here33333 rid", step)
            
            return [step.value, color.toString()];
          }),
          true
        );
          
        // console.log("here33333 grid", cloneDeep(grd))
        ctx.fillStyle = grd;
        ctx.fillRect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
      }

      
    useLayoutEffect(() => {
        options.hooks.drawClear = [(u: uPlot) => {
            const ctx = u.ctx;
            const { min: xMin, max: xMax } = u.scales.x;
            const { min: yMin, max: yMax } = u.scales[scaleKey];

            if (xMin == null || xMax == null || yMin == null || yMax == null) {
                return;
            }

            let { thresholds, mode } = thresholdsConfig;
            if (mode === ThresholdsMode .Percentage) {
                let [min, max] = getGradientRange(u, scaleKey, undefined, undefined, undefined, undefined);
                let range = max - min;

                thresholds = thresholds.map((step) => ({
                    ...step,
                    value: min + range * (step.value / 100),
                }));
            }
 
            ctx.save();


            const t = []
            for (const t1 of thresholds) {
                t.unshift(t1)
            }
            addAreas(u, scaleKey,  t);

            ctx.restore();
        }]
    }, [options, thresholdsConfig]);

    return null;
};
