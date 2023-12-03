// Copyright 2023 xObserve.io Team

import ThresholdEditor from 'src/views/dashboard/plugins/components/Threshold/ThresholdEditor'
import {
  EditorInputItem,
  EditorSliderItem,
} from 'src/components/editor/EditorItem'
import React, { memo } from 'react'
import { OverrideRule } from 'types/dashboard'
import { getSeriesDataOverrideTargets } from 'src/views/dashboard/utils/overrides'

interface Props {
  override: OverrideRule
  onChange: any
}

const GeomapOverridesEditor = ({ override, onChange }: Props) => {
  switch (override.type) {
    case GeomapRules.LocationName:
      return (
        <EditorInputItem
          value={override.value}
          onChange={onChange}
          placeholder='change location name'
        />
      )
    case GeomapRules.LocationFill:
      return (
        <EditorSliderItem
          value={override.value}
          min={0}
          max={1}
          step={0.1}
          onChange={onChange}
        />
      )
    case GeomapRules.LocationThresholds:
      return <ThresholdEditor value={override.value} onChange={onChange} />
    default:
      return <></>
  }
}
export default GeomapOverridesEditor

export enum GeomapRules {
  LocationName = 'Location.displayName',
  LocationFill = 'Location.fillOpacity',
  LocationThresholds = 'Location.thresholds',
}

export const getGeomapOverrideTargets = (panel, data) => {
  return getSeriesDataOverrideTargets(data)
}
