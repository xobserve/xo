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

export const renderStatsPlugin = (textColor = 'red') => {
  let startRenderTime

  function setStartTime() {
    startRenderTime = Date.now()
  }

  function drawStats(u) {
    let { ctx } = u
    let { left, top, width, height } = u.bbox
    let displayText = 'Time to Draw: ' + (Date.now() - startRenderTime) + 'ms'

    ctx.save()

    ctx.fillStyle = textColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(displayText, left + 10, top + 10)

    ctx.restore()
  }

  return {
    hooks: {
      drawClear: setStartTime,
      draw: drawStats,
    },
  }
}
