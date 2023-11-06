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

import uPlot from "uplot";

export const seriesPointsPlugin = ({ spikes = 4, outerRadius = 8, innerRadius = 4} = {}) => {
    outerRadius *= devicePixelRatio;
    innerRadius *= devicePixelRatio;

    // https://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5
    function drawStar(ctx, cx, cy) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    function drawPointsAsStars(u, i, i0, i1) {
        let { ctx } = u;
        let { _stroke, scale } = u.series[i];

        ctx.save();

        ctx.fillStyle = _stroke;

        let j = i0;

        while (j <= i1) {
            let val = u.data[i][j];
            let cx = Math.round(u.valToPos(u.data[0][j], 'x', true));
            let cy = Math.round(u.valToPos(val, scale, true));
            drawStar(ctx, cx, cy);
            ctx.fill();
            j++;
        };

        ctx.restore();
    }

    return {
        opts: (u, opts) => {
            opts.series.forEach((s, i) => {
                if (i > 0) {
                    uPlot.assign(s, {
                        points: {
                            show: drawPointsAsStars,
                        }
                    });
                }
            });
        },
        hooks: {}
    };
}