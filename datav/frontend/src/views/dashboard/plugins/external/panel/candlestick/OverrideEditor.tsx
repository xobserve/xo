// Copyright 2023 xObserve.io Team

import { EditorInputItem } from 'src/components/editor/EditorItem'
import { OverrideRule } from 'types/dashboard'
import React from 'react'
import { ColorPicker } from 'components/ColorPicker'
import { palettes } from 'utils/colors'

interface Props {
  override: OverrideRule
  onChange: any
}

const OverrideEditor = (props: Props) => {
  const { override, onChange } = props
  switch (override.type) {
    case OverrideRules.SeriesName:
      return (
        <EditorInputItem
          value={override.value}
          onChange={onChange}
          placeholder='change series name'
        />
      )
    case OverrideRules.SeriesColor:
      return (
        <ColorPicker
          color={override.value}
          onChange={onChange}
          defaultColor={palettes[0]}
        />
      )
    default:
      return <></>
  }
}

export default OverrideEditor

export enum OverrideRules {
  // basic
  SeriesName = 'Series.displayName',
  SeriesColor = 'Series.color',
}

// Get override targets names and values or overrides `Target name` selector
// e.g
/*
const res = []
const d: SeriesData[] = flatten(data)
    if (d.length > 0) {
        if (isArray(d[0].fields)) {
            for (const f of d[0].fields) {
                res.push({
                    label: f.name,
                    value: f.name
                })
            }
        }
    }
}
*/
// The above example will get targets from SeriesData, Table and Graph panels are using this method to get targets
// If return [] or null or undefined, xobserve will use the default function to get override targets
export const getOverrideTargets = (panel, data) => {
  // for demonstration purpose, we just return a hard coded targets list
  return ['Volume', 'MA5', 'MA10', 'MA20', 'MA30'].map((v) => ({
    label: v,
    value: v,
  }))
}
