// Copyright (c) 2020 The Jaeger Authors.
//

const PARAMETER_REG_EXP = /#\{([^{}]*)\}/g

export function encodedStringSupplant(
  str: string,
  encodeFn: null | ((unencoded: string | number) => string),
  map: Record<string, string | number | undefined>,
) {
  return str.replace(PARAMETER_REG_EXP, (_, name) => {
    const mapValue = map[name]
    const value = mapValue != null && encodeFn ? encodeFn(mapValue) : mapValue
    return value == null ? '' : `${value}`
  })
}

export default function stringSupplant(
  str: string,
  map: Record<string, string | number | undefined>,
) {
  return encodedStringSupplant(str, null, map)
}

export function getParamNames(str: string) {
  const names = new Set<string>()
  str.replace(PARAMETER_REG_EXP, (match, name) => {
    names.add(name)
    return match
  })
  return Array.from(names)
}
