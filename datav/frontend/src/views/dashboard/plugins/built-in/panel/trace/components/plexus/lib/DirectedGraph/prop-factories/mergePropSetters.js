// Copyright (c) 2018 Uber Technologies, Inc.
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
export default function mergePropSetters() {
  for (
    var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0;
    _key2 < _len2;
    _key2++
  ) {
    fns[_key2] = arguments[_key2]
  }
  return (input) => {
    const propsList = []
    for (let i = 0; i < fns.length; i++) {
      const props = fns[i](input)
      // TypeScript doesn't believe in `.filter(Boolean)`, so do this manually
      // http://t.uber.com/joef-ts-strict-filter-boolean
      if (props) {
        propsList.push(props)
      }
    }
    return propsList.reduce(reduce)
  }
}
