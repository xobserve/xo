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

import { parseVariableFormat } from './format'
import { PanelQuery } from 'types/dashboard'
import {
  BuiltinVars,
  VariableInterval,
  VariableRange,
  VariableSplitChar,
  VariableTeam,
  VariableTimerangeFrom,
  VariableTimerangeTo,
  VarialbeAllOption,
} from 'src/data/variable'
import { $variables } from 'src/views/variables/store'
import { isEmpty } from './validate'
import { externalDatasourcePlugins } from 'src/views/dashboard/plugins/external/plugins'
import { builtinDatasourcePlugins } from 'src/views/dashboard/plugins/built-in/plugins'
import { TimeRange } from 'types/time'
import { concat, isObject } from 'lodash'
import { getCurrentTimeRange } from 'components/DatePicker/TimePicker'
import { formatDuration } from './date'
import { $config } from 'src/data/configs/config'
import { Variable } from 'types/variable'

export const hasVariableFormat = (s: string) => {
  return isEmpty(s) ? false : s.includes('${')
}

// replace ${xxx} format with corresponding variable
// extraVars: xobserve preserved variables, such as __curentValue__
export const replaceWithVariables = (
  s: string,
  extraVars: {
    [varName: string]: string | number
  },
  pvariables?: Variable[]
) => {
  const vars =  concat(pvariables??[],$variables.get()) 
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

  s = replaceWithBuiltinVariables(s, {}, formats)

  return s
}

export const replaceWithBuiltinVariables = (
  s: string,
  builtinVars: Partial<BuiltinVars>,
  formats0?: string[],
) => {
  const formats = formats0 ?? parseVariableFormat(s)
  for (const f of formats) {
    if (f == VariableInterval && builtinVars.interval) {
      s = s.replaceAll(`\${${f}}`, builtinVars.interval)
      continue
    }

    const timeRange = builtinVars.timeRange ?? getCurrentTimeRange()
    if (f == VariableTimerangeFrom) {
      s = s.replaceAll(
        `\${${f}}`,
        (timeRange.start.getTime() / 1000).toString(),
      )
      continue
    }

    if (f == VariableTimerangeTo) {
      s = s.replaceAll(`\${${f}}`, (timeRange.end.getTime() / 1000).toString())
    }

    if (f == VariableRange) {
      const intv = timeRange.end.getTime() - timeRange.start.getTime()
      s = s.replaceAll(`\${${VariableRange}}`, formatDuration(intv * 1000))
    }

    if (f == VariableTeam) {
      const teamId = builtinVars.teamId ?? $config.get().currentTeam
      s = s.replaceAll(`\${${VariableTeam}}`, teamId.toString())
    }
  }

  return s
}

export const replaceQueryWithVariables = (
  q: PanelQuery,
  dsType: string,
  interval: string,
  timeRange: TimeRange,
  pvariables?: Variable[],
) => {
  const p =
    builtinDatasourcePlugins[dsType] ?? externalDatasourcePlugins[dsType]
  if (p && p.replaceQueryWithVariables) {
    p.replaceQueryWithVariables(q, interval, pvariables)
  }

  q.metrics = replaceWithBuiltinVariables(q.metrics, {
    interval,
    timeRange,
  })

  if (q.data.enableVariableKeys) {
    const keys = q.data.enableVariableKeys
    for (const k of keys) {
      const v = q.data[k]
      if (isObject(v)) {
        if (p && p.replaceQueryWithVariables) {
          q.data[k] = JSON.parse(
            p.replaceQueryWithVariables(JSON.stringify(v), interval, pvariables),
          )
        } else {
          q.data[k] = JSON.parse(replaceWithVariables(JSON.stringify(v), null, pvariables))
        }
      } else {
        if (p && p.replaceQueryWithVariables) {
          q.data[k] = p.replaceQueryWithVariables(v, interval, pvariables)
        } else {
          q.data[k] = replaceWithVariables(v, null, pvariables)
        }
      }
    }
  }
}

export const replaceWithRangeVariable = (s: string) => {
  const range = getCurrentTimeRange()
  const intv = range.end.getTime() - range.start.getTime()
  const s1 = s.replaceAll(`\${${VariableRange}}`, formatDuration(intv * 1000))
  return s1
}
// replace ${xxx} format in s with every possible value of the variable
// if s doesn't contain any variable, return [s]
export const replaceWithVariablesHasMultiValues = (
  s: string,
  replaceAllWith: string,
  pvariables?: Variable[]
): string[] => {
  const vars = concat(pvariables??[],$variables.get())
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
