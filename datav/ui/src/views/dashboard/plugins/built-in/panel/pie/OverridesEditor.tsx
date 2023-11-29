// Copyright 2023 xObserve.io Team

import { ColorPicker } from 'src/components/ColorPicker'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import { OverrideRule } from 'types/dashboard'
import React from 'react'
import { palettes } from 'utils/colors'
import { getSeriesDataOverrideTargets } from 'src/views/dashboard/utils/overrides'

interface Props {
  override: OverrideRule
  onChange: any
}

const PieOverridesEditor = ({ override, onChange }: Props) => {
  switch (override.type) {
    case PieRules.SeriesName:
      return (
        <EditorInputItem
          value={override.value}
          onChange={onChange}
          placeholder='change series name'
        />
      )
    case PieRules.SeriesColor:
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

export default PieOverridesEditor

export enum PieRules {
  SeriesName = 'Series.displayName',
  SeriesColor = 'Series.color',
}

export const getPieOverrideTargets = (panel, data) => {
  return getSeriesDataOverrideTargets(data)
}
