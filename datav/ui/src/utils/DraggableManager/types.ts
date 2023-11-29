// Copyright (c) 2017 Uber Technologies, Inc.
//

import type React from 'react'

import DraggableManager from './DraggableManager'
import EUpdateTypes from './EUpdateTypes'
import { TNil } from 'types/misc'

export type DraggableBounds = {
  clientXLeft: number
  maxValue?: number
  minValue?: number
  width: number
}

export type DraggingUpdate = {
  event: React.MouseEvent<any> | MouseEvent
  manager: DraggableManager
  tag: string | TNil
  type: EUpdateTypes
  value: number
  x: number
}
