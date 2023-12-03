// Copyright (c) 2019 Uber Technologies, Inc.
//

function reduce(a, b) {
  // eslint-disable-next-line prefer-const
  let { className, style, ...rest } = a
  const { className: bClassName, style: bStyle, ...bRest } = b
  // merge className props
  if (bClassName) {
    className = className ? `${className} ${bClassName}` : bClassName
  }
  // merge style props
  if (bStyle && typeof bStyle === 'object') {
    style = style
      ? {
          ...style,
          ...bStyle,
        }
      : bStyle
  }
  return {
    className,
    style,
    ...rest,
    ...bRest,
  }
}
export function assignMergeCss() {
  for (
    var _len = arguments.length, objs = new Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    objs[_key] = arguments[_key]
  }
  return objs.reduce(reduce)
}
export function getProps(propSpec) {
  for (
    var _len2 = arguments.length,
      args = new Array(_len2 > 1 ? _len2 - 1 : 0),
      _key2 = 1;
    _key2 < _len2;
    _key2++
  ) {
    args[_key2 - 1] = arguments[_key2]
  }
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

  const DEFAULT_PARAMS = {
    expAdjuster: 0.5,
    factorMax: 1,
    factorMin: 0,
    valueMax: 1,
    valueMin: 0.3,
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function getValueScaler() {
    let config =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    const { expAdjuster, factorMax, factorMin, valueMax, valueMin } = {
      ...DEFAULT_PARAMS,
      ...config,
    }
    return function scaleValue(factor) {
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
export function isSamePropSetter(a, b) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false
    }
    return !a.some((item, i) => item !== b[i])
  }
  return a === b
}
