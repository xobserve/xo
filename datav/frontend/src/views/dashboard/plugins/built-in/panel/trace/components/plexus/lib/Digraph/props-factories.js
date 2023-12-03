// Copyright (c) 2019 Uber Technologies, Inc.
//

import { getValueScaler } from './utils'
export const classNameIsSmall = (() => {
  // define via an IIFE to sequester consts
  const SCALE_THRESHOLD_SMALL = 0.29

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function classNameIsSmall(graphState) {
    const { k = 1 } = graphState.zoomTransform || {}
    if (k <= SCALE_THRESHOLD_SMALL) {
      return {
        className: 'is-small',
      }
    }
    return null
  }
  return classNameIsSmall
})()
export const scaleProperty = (() => {
  // define via an IIFE to sequester consts
  const MAX = 1
  const MIN = 0.3
  const EXP_ADJUSTER = 0.5

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function scaleProperty(property) {
    let valueMin =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MIN
    let valueMax =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MAX
    let expAdjuster =
      arguments.length > 3 && arguments[3] !== undefined
        ? arguments[3]
        : EXP_ADJUSTER
    const defaultStyle = {
      style: {
        [property]: valueMax,
      },
    }
    const fnName = `scale_${property}`
    const valueScaler = getValueScaler({
      valueMax,
      valueMin,
      expAdjuster,
    })
    const o = {
      [fnName](graphState) {
        const { zoomTransform } = graphState
        if (!zoomTransform) {
          return defaultStyle
        }
        const value = valueScaler(zoomTransform.k)
        return {
          style: {
            [property]: value,
          },
        }
      },
    }
    return o[fnName]
  }
  scaleProperty.opacity = scaleProperty('opacity')
  scaleProperty.strokeOpacity = scaleProperty('strokeOpacity')
  scaleProperty.strokeOpacityStrong = scaleProperty(
    'strokeOpacity',
    MIN,
    MAX,
    0.75,
  )
  scaleProperty.strokeOpacityStrongest = scaleProperty(
    'strokeOpacity',
    MIN,
    MAX,
    1,
  )
  return scaleProperty
})()
