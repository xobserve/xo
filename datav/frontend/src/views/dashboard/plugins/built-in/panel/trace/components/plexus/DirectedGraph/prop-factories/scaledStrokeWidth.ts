// Copyright (c) 2018 Uber Technologies, Inc.
//

import { TDirectedGraphState } from '../types'

const STROKE_MAX = 4.2
const STROKE_MIN = 2
const STROKE_SPREAD = STROKE_MAX - STROKE_MIN
const PROPS_MAX = { style: { strokeWidth: STROKE_MAX.toFixed(1) } }
const PROPS_MIN = { style: { strokeWidth: STROKE_MIN.toFixed(1) } }

const THRESHOLD_MAX = 0.1
const THRESHOLD_MIN = 0.6
const THRESHOLD_SPREAD = THRESHOLD_MIN - THRESHOLD_MAX

const cache: { [key: string]: { style: { strokeWidth: string } } } = {}
let lastK = -Number.MIN_VALUE
let lastProps = PROPS_MIN

export default function scaledStrokeWidth(graphState: TDirectedGraphState) {
  const { k = 1 } = graphState.zoomTransform || {}
  if (k === lastK) {
    return lastProps
  }
  let props = lastProps
  if (k > THRESHOLD_MIN) {
    props = PROPS_MIN
  } else if (k < THRESHOLD_MAX) {
    props = PROPS_MAX
  } else {
    const strokeWidth = (
      STROKE_MIN +
      (STROKE_SPREAD * (THRESHOLD_MIN - k)) / THRESHOLD_SPREAD
    ).toFixed(1)
    props =
      cache[strokeWidth] || (cache[strokeWidth] = { style: { strokeWidth } })
  }
  lastK = k
  lastProps = props
  return props
}
