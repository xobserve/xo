// Copyright (c) 2019 Uber Technologies, Inc.
//

import { TPropFactoryFn, TSetProps } from './types'

function reduce(a: Record<string, any>, b: Record<string, any>) {
  // eslint-disable-next-line prefer-const
  let { className, style, ...rest } = a
  const { className: bClassName, style: bStyle, ...bRest } = b
  // merge className props
  if (bClassName) {
    className = className ? `${className} ${bClassName}` : bClassName
  }
  // merge style props
  if (bStyle && typeof bStyle === 'object') {
    style = style ? { ...style, ...bStyle } : bStyle
  }
  return { className, style, ...rest, ...bRest }
}

export function assignMergeCss(...objs: Record<string, any>[]) {
  return objs.reduce(reduce)
}

export function getProps<TFactoryFn extends TPropFactoryFn>(
  propSpec: TSetProps<TFactoryFn> | void,
  ...args: Parameters<TFactoryFn>
) {
  if (!propSpec) {
    return {}
  }
  const specs = Array.isArray(propSpec) ? propSpec : [propSpec]
  const propsList = specs.map((spec) =>
    typeof spec === 'function' ? spec(...args) || {} : spec,
  )
  return assignMergeCss(...propsList)
}

export const getValueScaler = (() => {
  // define via an IIFE to sequester non-public stuff
  type TScalerParams = {
    expAdjuster: number
    factorMax: number
    factorMin: number
    valueMax: number
    valueMin: number
  }
  const DEFAULT_PARAMS: TScalerParams = {
    expAdjuster: 0.5,
    factorMax: 1,
    factorMin: 0,
    valueMax: 1,
    valueMin: 0.3,
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function getValueScaler(config: Partial<TScalerParams> = {}) {
    const { expAdjuster, factorMax, factorMin, valueMax, valueMin } = {
      ...DEFAULT_PARAMS,
      ...config,
    }
    return function scaleValue(factor: number) {
      if (factor >= factorMax) {
        return valueMax
      }
      if (factor <= factorMin) {
        return valueMin
      }
      return (
        valueMin +
        ((factor - factorMin) / (factorMax - factorMin)) ** expAdjuster *
          (valueMax - valueMin)
      )
    }
  }
  return getValueScaler
})()

export function isSamePropSetter(a: TSetProps<any>, b: TSetProps<any>) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false
    }
    return !a.some((item: any, i: number) => item !== b[i])
  }
  return a === b
}
