// Copyright 2023 xObserve.io Team

// Render series table in tooltip

import { ColorPicker } from 'src/components/ColorPicker'
import {
  EditorInputItem,
  EditorNumberItem,
  EditorSliderItem,
} from 'src/components/editor/EditorItem'
import { UnitPicker } from 'src/views/dashboard/plugins/components/UnitPicker'
import { OverrideRule } from 'types/dashboard'
import React from 'react'
import ThresholdEditor from 'src/views/dashboard/plugins/components/Threshold/ThresholdEditor'

interface Props {
  override: OverrideRule
  onChange: any
}

const AlertOverridesEditor = ({ override, onChange }: Props) => {
  switch (override.type) {
    // case BarRules.SeriesStyle:
    //     return <RadionButtons size="sm" options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={override.value} onChange={onChange} />
    case AlertRules.SeriesName:
      return (
        <EditorInputItem
          value={override.value}
          onChange={onChange}
          size='sm'
          placeholder='change series name'
        />
      )
    // case BarRules.SeriesUnit:
    //     return <UnitPicker size="sm" value={override.value} onChange={onChange} />
    // case BarRules.SeriesColor:
    //     return <ColorPicker color={override.value} onChange={onChange} />
    // case BarRules.SeriesFill:
    //     return <EditorSliderItem value={override.value} min={10} max={100} step={1} onChange={onChange} />
    // case BarRules.SeriesNegativeY:
    //     return <></>
    // case BarRules.SeriesYAxist:
    //     return <></>
    // case BarRules.SeriesDecimal:
    //     return <EditorNumberItem value={override.value} min={0} max={5} step={1} onChange={onChange} />
    // case BarRules.SeriesThresholds:
    //     return <ThresholdEditor value={override.value} onChange={onChange} />
    default:
      return <></>
  }
}

export default AlertOverridesEditor

export enum AlertRules {
  SeriesName = 'Series.name',
}
