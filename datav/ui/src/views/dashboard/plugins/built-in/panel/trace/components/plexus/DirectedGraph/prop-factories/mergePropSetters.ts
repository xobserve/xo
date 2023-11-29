// Copyright (c) 2018 Uber Technologies, Inc.
//

import { TPropsFactoryFn } from '../types'

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

export default function mergePropSetters<U>(
  ...fns: TPropsFactoryFn<U>[]
): TPropsFactoryFn<U> {
  return (input: U) => {
    const propsList: Record<string, any>[] = []
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
