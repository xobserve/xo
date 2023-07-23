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
import { ThresholdDisplay } from 'types/panel/plugins';
import { Threshold, ThresholdsConfig, ThresholdsMode } from 'types/threshold';
import uPlot from 'uplot';
import { paletteColorNameToHex } from 'utils/colors';
import { getGradientRange, scaleGradient } from '../gradientFill';


interface Props {
    thresholdsConfig: ThresholdsConfig
    options: uPlot.Options;
    display: ThresholdDisplay
}

export const ThresholdsPlugin = ({ thresholdsConfig, options, display }: Props) => {
    const {colorMode} = useColorMode()
    const scaleKey = 'y'
    const dashSegments = display === ThresholdDisplay.DashedLine || display === ThresholdDisplay.AreaDashedLine ? [10, 10] : undefined;
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
            
            return [step.value, color.toString()];
          }),
          true
        );
          
        ctx.fillStyle = grd;
        ctx.fillRect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
      }

      function addLines(u: uPlot, yScaleKey: string, steps: Threshold[]) {
        let ctx = u.ctx;
    
        // Thresholds below a transparent threshold is treated like "less than", and line drawn previous threshold
        let transparentIndex = 0;
    
        for (let idx = 0; idx < steps.length; idx++) {
          const step = steps[idx];
          if (step.color === 'transparent') {
            transparentIndex = idx;
            break;
          }
        }
    
        ctx.lineWidth = 2;
    
        if (dashSegments) {
          ctx.setLineDash(dashSegments);
        }
    
        // Ignore the base -Infinity threshold by always starting on index 1
        for (let idx = 1; idx < steps.length; idx++) {
          const step = steps[idx];
          let color: tinycolor.Instance;
    
          // if we are below a transparent index treat this a less then threshold, use previous thresholds color
          if (transparentIndex >= idx && idx > 0) {
            color = tinycolor(paletteColorNameToHex(steps[idx - 1].color,colorMode));
          } else {
            color = tinycolor(paletteColorNameToHex(step.color,colorMode));
          }
    
          // Unless alpha specififed set to default value
          if (color.getAlpha() === 1) {
            color.setAlpha(0.7);
          }
    
          let x0 = Math.round(u.bbox.left);
          let y0 = Math.round(u.valToPos(step.value, yScaleKey, true));
          let x1 = Math.round(u.bbox.left + u.bbox.width);
          let y1 = Math.round(u.valToPos(step.value, yScaleKey, true));
    
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
    
          ctx.strokeStyle = color.toString();
          ctx.stroke();
        }
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
            switch (display) {
                case ThresholdDisplay.Area:
                    addAreas(u, scaleKey,  t)
                    break;
                case ThresholdDisplay.Line:
                case ThresholdDisplay.DashedLine:
                    addLines(u,scaleKey,t)
                    break 
                case ThresholdDisplay.AreaLine:
                case ThresholdDisplay.AreaDashedLine:
                    addAreas(u, scaleKey,  t)
                    addLines(u,scaleKey,t)
                    break
            }
        
            ctx.restore();
        }]
    }, [options, thresholdsConfig]);

    return null;
};
