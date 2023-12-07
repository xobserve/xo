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

import React, { CSSProperties } from 'react'

import { calculateGridDimensions } from './utils'
import { LayoutOrientation } from 'types/layout'

interface Props {
  renderValue: any
  height: number
  width: number
  orientation: LayoutOrientation
  itemSpacing?: number
  /** When orientation is set to auto layout items in a grid */
  autoGrid?: boolean
  minVizWidth?: number
  minVizHeight?: number
  values: any[]
}

const AutoGrid = (props: Props) => {
  const {
    renderValue,
    height,
    width,
    itemSpacing = 8,
    orientation,
    values,
  } = props

  const grid = calculateGridDimensions(
    width,
    height,
    itemSpacing,
    values.length,
  )

  let xGrid = 0
  let yGrid = 0
  let items: JSX.Element[] = []

  for (let i = 0; i < values.length; i++) {
    const isLastRow = yGrid === grid.yCount - 1

    const itemWidth = isLastRow ? grid.widthOnLastRow : grid.width
    const itemHeight = grid.height

    const xPos = xGrid * itemWidth + itemSpacing * xGrid
    const yPos = yGrid * itemHeight + itemSpacing * yGrid

    const itemStyles: CSSProperties = {
      position: 'absolute',
      left: xPos,
      top: yPos,
      width: `${itemWidth}px`,
      height: `${itemHeight}px`,
    }

    items.push(
      <div key={i} style={itemStyles}>
        {renderValue({
          width: itemWidth,
          height: itemHeight,
          value: values[i],
        })}
      </div>,
    )

    xGrid++

    if (xGrid === grid.xCount) {
      xGrid = 0
      yGrid++
    }
  }

  return <div style={{ position: 'relative' }}>{items}</div>
}

export default AutoGrid
