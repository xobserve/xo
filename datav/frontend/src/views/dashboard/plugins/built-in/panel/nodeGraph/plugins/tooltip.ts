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

import G6 from '@antv/g6'
import { NodeGraphSettings } from '../types'

export const initTooltip = (settings: NodeGraphSettings) => {
  const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 10,
    itemTypes: ['node'],
    trigger: settings.node.tooltipTrigger ?? 'mouseenter',
    getContent: (e) => {
      const model = e.item.getModel()
      const outDiv = document.createElement('div')
      outDiv.style.width = 'fit-content'
      outDiv.style.padding = '0px 4px 0px 10px'
      outDiv.style.fontSize = '12px'
      let li = ''
      Object.keys(model.data).map((key) => {
        li += `<li>${key}: ${model.data[key]}</li>`
      })
      outDiv.innerHTML = `
                <strong><h3>${model.label}</h3></strong>
                <ul>
                ${li}
                </ul>`
      return outDiv
    },
  })

  return tooltip
}
