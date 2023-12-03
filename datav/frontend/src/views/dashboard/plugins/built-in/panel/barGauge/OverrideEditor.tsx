// Copyright 2023 xObserve.io Team

import RadionButtons from 'src/components/RadioButtons'
import {
  EditorInputItem,
  EditorNumberItem,
  EditorSliderItem,
} from 'src/components/editor/EditorItem'
import { UnitPicker } from 'src/views/dashboard/plugins/components/UnitPicker'
import { OverrideRule, Panel } from 'types/dashboard'
import React, { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { barGaugePanelMsg, commonMsg, tablePanelMsg } from 'src/i18n/locales/en'
import { Checkbox, HStack, Text } from '@chakra-ui/react'
import { isEmpty } from 'utils/validate'
import ThresholdEditor from 'src/views/dashboard/plugins/components/Threshold/ThresholdEditor'
import { cloneDeep } from 'lodash'
import { getSeriesDataOverrideTargets } from 'src/views/dashboard/utils/overrides'

interface Props {
  override: OverrideRule
  onChange: any
}

const BarGaugeOverridesEditor = ({ override, onChange }: Props) => {
  const t1 = useStore(barGaugePanelMsg)
  switch (override.type) {
    case BarGaugeRules.SeriesName:
      return <OverrideNameEditor value={override.value} onChange={onChange} />
    case BarGaugeRules.SeriesFromMinMax:
      return (
        <RadionButtons
          options={[
            { label: t1.allSeries, value: 'all' },
            { label: t1.currentSeries, value: 'series' },
          ]}
          value={override.value}
          onChange={onChange}
        />
      )
    case BarGaugeRules.SeriesMin:
      return <EditorNumberItem value={override.value} onChange={onChange} />
    case BarGaugeRules.SeriesMax:
      return <EditorNumberItem value={override.value} onChange={onChange} />
    case BarGaugeRules.SeriesDecimal:
      return (
        <EditorNumberItem
          min={0}
          max={5}
          step={1}
          value={override.value}
          onChange={onChange}
        />
      )
    case BarGaugeRules.SeriesUnits:
      return <UnitPicker size='sm' value={override.value} onChange={onChange} />
    case BarGaugeRules.SeriesThresholds:
      return <ThresholdEditor value={override.value} onChange={onChange} />
    default:
      return <></>
  }
}

export default BarGaugeOverridesEditor

export enum BarGaugeRules {
  SeriesName = 'Series.displayName',
  SeriesMin = 'Series.min',
  SeriesMax = 'Series.max',
  SeriesThresholds = 'Series.thresholds',
  SeriesUnits = 'Series.units',
  SeriesDecimal = 'Series.decimal',
  SeriesFromMinMax = 'Series.fromMinMax',
}

const OverrideNameEditor = ({ value, onChange }) => {
  if (isEmpty(value)) {
    value = {}
  }

  return (
    <>
      <EditorInputItem
        value={value.name}
        onChange={(v) => {
          value.name = v
          onChange(cloneDeep(value))
        }}
        size='sm'
        placeholder='change series name'
      />
      <HStack>
        <Text fontSize='sm' color='gray.500' mt={1}>
          Override filed name
        </Text>
        <Checkbox
          isChecked={value.overrideField}
          onChange={(e) => {
            value.overrideField = e.currentTarget.checked
            onChange(cloneDeep(value))
          }}
        />
      </HStack>
    </>
  )
}

export const getBarguageOverrideTargets = (panel, data) => {
  return getSeriesDataOverrideTargets(data)
}
