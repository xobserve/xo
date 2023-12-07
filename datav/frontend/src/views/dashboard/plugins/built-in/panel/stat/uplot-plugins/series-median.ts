// Copyright 2023 xobserve.io Team
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

export const seriesMediansPlugin = ({ lineWidth = 50, blur = 6 } = {}) => {
  lineWidth *= devicePixelRatio
  let medians

  function hexToRgbA(hex, a) {
    hex = hex.replace('#', '')

    if (hex.length == 3)
      hex = hex
        .split('')
        .map((c) => c.repeat(2))
        .join('')

    let r = parseInt(hex.substring(0, 2), 16)
    let g = parseInt(hex.substring(2, 4), 16)
    let b = parseInt(hex.substring(4, 6), 16)

    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
  }

  // https://www.jstips.co/en/javascript/array-average-and-median/
  function calculateMedians(u) {
    medians = u.data.map((data) => {
      data = [...data]
      data.sort((a, b) => a - b)
      return (data[(data.length - 1) >> 1] + data[data.length >> 1]) / 2
    })
  }

  function drawSeriesMedian(u, i) {
    let { ctx } = u
    let { left, top, width, height } = u.bbox
    let { _stroke, scale } = u.series[i]

    let cy = Math.round(u.valToPos(medians[i], scale, true))

    ctx.save()
    ctx.beginPath()
    ctx.rect(left, top, width, height)
    ctx.clip()
    ctx.strokeStyle = hexToRgbA(_stroke, 0.2)
    ctx.lineWidth = lineWidth

    if (blur) ctx.filter = 'blur(' + blur + 'px)'

    ctx.beginPath()
    ctx.moveTo(left, cy)
    ctx.lineTo(left + width, cy)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  return {
    hooks: {
      setData: calculateMedians,
      drawSeries: drawSeriesMedian,
    },
  }
}
