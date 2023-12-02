// Copyright 2023 xObserve.io Team

import { parseVariableFormat } from './format'
import { PanelQuery } from 'types/dashboard'
import {
  VariableInterval,
  VariableSplitChar,
  VariableTimerangeFrom,
  VariableTimerangeTo,
  VarialbeAllOption,
} from 'src/data/variable'
import { $variables } from 'src/views/variables/store'
import { isEmpty } from './validate'
import { externalDatasourcePlugins } from 'src/views/dashboard/plugins/external/plugins'
import { builtinDatasourcePlugins } from 'src/views/dashboard/plugins/built-in/plugins'
import { TimeRange } from 'types/time'
import { isObject, zip } from 'lodash'

export const hasVariableFormat = (s: string) => {
  return isEmpty(s) ? false : s.includes('${')
}

// replace ${xxx} format with corresponding variable
// extraVars: xobserve preserved variables, such as __curentValue__
export const replaceWithVariables = (
  s: string,
  extraVars?: {
    [varName: string]: string | number
  },
) => {
  const vars = $variables.get()
  const formats = parseVariableFormat(s)
  for (const f of formats) {
    const extrav = extraVars && extraVars[f]
    if (extrav) {
      s = s.replaceAll(`\${${f}}`, extrav.toString())
      continue
    }

    const v = vars.find((v) => v.name == f)
    if (v) {
      s = s.replaceAll(`\${${f}}`, v.selected)
    }
  }

  return s
}

export const replaceQueryWithVariables = (
  q: PanelQuery,
  dsType: string,
  interval: string,
  timeRange: TimeRange,
) => {
  const p =
    builtinDatasourcePlugins[dsType] ?? externalDatasourcePlugins[dsType]
  if (p && p.replaceQueryWithVariables) {
    p.replaceQueryWithVariables(q, interval)
  }

  const formats = parseVariableFormat(q.metrics)
  for (const f of formats) {
    if (f == VariableInterval) {
      q.metrics = q.metrics.replaceAll(`\${${f}}`, interval)
      continue
    }

    if (f == VariableTimerangeFrom) {
      q.metrics = q.metrics.replaceAll(
        `\${${f}}`,
        (timeRange.start.getTime() / 1000).toString(),
      )
      continue
    }

    if (f == VariableTimerangeTo) {
      q.metrics = q.metrics.replaceAll(
        `\${${f}}`,
        (timeRange.end.getTime() / 1000).toString(),
      )
    }
  }

  if (q.data.enableVariableKeys) {
    const keys = q.data.enableVariableKeys
    for (const k of keys) {
      const v = q.data[k]
      if (isObject(v)) {
        if (p && p.replaceQueryWithVariables) {
          q.data[k] = JSON.parse(
            p.replaceQueryWithVariables(JSON.stringify(v), interval),
          )
        } else {
          q.data[k] = JSON.parse(replaceWithVariables(JSON.stringify(v)))
        }
      } else {
        if (p && p.replaceQueryWithVariables) {
          q.data[k] = p.replaceQueryWithVariables(v, interval)
        } else {
          q.data[k] = replaceWithVariables(v)
        }
      }
    }
  }
}

// replace ${xxx} format in s with every possible value of the variable
// if s doesn't contain any variable, return [s]
export const replaceWithVariablesHasMultiValues = (
  s: string,
  replaceAllWith?,
): string[] => {
  const vars = $variables.get()
  let res = []

  const formats = parseVariableFormat(s)
  if (formats.length == 0) {
    return [s]
  }

  const targets0 = []
  for (const f of formats) {
    const t = []
    // const v = (vars.length > 0 ? vars : gvariables).find(v => v.name ==f)
    const v = vars.find((v) => v.name == f)
    if (v) {
      let selected = []
      if (v.selected == VarialbeAllOption) {
        if (replaceAllWith) {
          selected.push(replaceAllWith)
        } else {
          selected = v.values?.filter((v1) => v1 != VarialbeAllOption) ?? []
        }
      } else {
        selected = isEmpty(v.selected)
          ? []
          : v.selected.split(VariableSplitChar)
      }

      selected.forEach((v) => t.push(v))
    }
    if (t.length == 0) {
      t.push('')
    }
    targets0.push(t)
  }

  const results = []

  function permute(arr, mmo) {
    if (arr.length == 0) {
      results.push(mmo)
      return
    }
    for (let i = 0; i < arr[0].length; i++) {
      permute(arr.slice(1), mmo.concat(arr[0][i]))
    }
  }
  permute(targets0, [])

  for (const r of results) {
    let s1 = s
    for (let i = 0; i < formats.length; i++) {
      s1 = s1.replaceAll(`\${${formats[i]}}`, r[i])
    }
    res.push(s1)
  }

  if (res.length == 0) {
    res.push(s)
  }

  return res
}
