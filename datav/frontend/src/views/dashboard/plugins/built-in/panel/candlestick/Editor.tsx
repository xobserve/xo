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

import { Switch } from '@chakra-ui/react'
import PanelAccordion from 'src/views/dashboard/edit-panel/Accordion'
import PanelEditItem from 'src/views/dashboard/edit-panel/PanelEditItem'
import React, { memo } from 'react'
import { useStore } from '@nanostores/react'
import { commonMsg } from 'src/i18n/locales/en'
import {
  CandleEditorProps,
  CandlePanel as Panel,
  PanelTypeCandle,
  PluginSettings,
  downColor,
  upColor,
} from './types'
import { EditorInputItem, EditorNumberItem } from 'components/editor/EditorItem'
import { dispatch } from 'use-bus'
import { PanelForceRebuildEvent } from 'src/data/bus-events'
import RadionButtons from 'components/RadioButtons'
import { Units } from 'types/panel/plugins'
import { ColorPicker } from 'components/ColorPicker'
import { UnitPicker } from '../../../components/UnitPicker'

const PanelEditor = memo(({ panel, onChange }: CandleEditorProps) => {
  const t = useStore(commonMsg)
  const options: PluginSettings = panel.plugins[PanelTypeCandle]

  return (
    <>
      <PanelAccordion title={t.basicSetting}>
        <PanelEditItem title={t.animation} desc={t.animationTips}>
          <Switch
            defaultChecked={options.animation}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].animation =
                  e.currentTarget.checked
                // force the panel to rebuild to avoid some problems
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={'Chart opacity'}>
          <EditorNumberItem
            value={options.chartOpacity}
            min={0}
            max={1}
            step={0.1}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].chartOpacity = v
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
      <PanelAccordion title={'K chart'}>
        <PanelEditItem title='Display name'>
          <EditorInputItem
            value={options.kChart.displayName}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].kChart.displayName = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Fix tooltip'>
          <Switch
            defaultChecked={options.kChart.fixTooltip}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].kChart.fixTooltip =
                  e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Up color'>
          <ColorPicker
            color={options.kChart.upColor}
            presetColors={[{ label: 'default', value: upColor }]}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].kChart.upColor = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Down color'>
          <ColorPicker
            color={options.kChart.downColor}
            presetColors={[{ label: 'default', value: downColor }]}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].kChart.downColor = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Y-axis split line'>
          <Switch
            defaultChecked={options.kChart.splitLine}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].kChart.splitLine =
                  e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Y-axis split area'>
          <Switch
            defaultChecked={options.kChart.splitArea}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].kChart.splitArea =
                  e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
      <PanelAccordion title={'Volume chart'}>
        <PanelEditItem title='Show'>
          <Switch
            defaultChecked={options.volumeChart.show}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].volumeChart.show =
                  e.currentTarget.checked
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem
          title='Sync color'
          desc='Whether use the same colors as K chart'
        >
          <Switch
            defaultChecked={options.volumeChart.syncColor}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].volumeChart.syncColor =
                  e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Show Y-axis label'>
          <Switch
            defaultChecked={options.volumeChart.showYAxisLabel}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].volumeChart.showYAxisLabel =
                  e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Y-axis split line'>
          <Switch
            defaultChecked={options.volumeChart.splitLine}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].volumeChart.splitLine =
                  e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t.unit}>
          <UnitPicker
            value={options.volumeChart.value}
            onChange={(v: Units) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].volumeChart.value.units = v.units
                panel.plugins[PanelTypeCandle].volumeChart.value.unitsType =
                  v.unitsType
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t.decimal}>
          <EditorNumberItem
            value={options.volumeChart.value.decimal}
            min={0}
            max={5}
            step={1}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].volumeChart.value.decimal = v
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
      <PanelAccordion title={'Mark on chart'}>
        <PanelEditItem title='Max point'>
          <RadionButtons
            options={[
              { label: 'None', value: 'none' },
              { label: 'Highest', value: 'highest' },
              { label: 'Close', value: 'close' },
            ]}
            value={options.mark.maxPoint}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].mark.maxPoint = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Min point'>
          <RadionButtons
            options={[
              { label: 'None', value: 'none' },
              { label: 'Lowest', value: 'lowest' },
              { label: 'Open', value: 'open' },
            ]}
            value={options.mark.minPoint}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].mark.minPoint = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Min Line'>
          <RadionButtons
            options={[
              { label: 'None', value: 'none' },
              { label: 'Lowest', value: 'lowest' },
              { label: 'Open', value: 'open' },
            ]}
            value={options.mark.minLine}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].mark.minLine = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Max Line'>
          <RadionButtons
            options={[
              { label: 'None', value: 'none' },
              { label: 'Highest', value: 'highest' },
              { label: 'Close', value: 'close' },
            ]}
            value={options.mark.maxLine}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].mark.maxLine = v
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
      <PanelAccordion title='Value'>
        <PanelEditItem title={t.unit}>
          <UnitPicker
            value={options.value}
            onChange={(v: Units) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].value.units = v.units
                panel.plugins[PanelTypeCandle].value.unitsType = v.unitsType
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t.decimal}>
          <EditorNumberItem
            value={options.value.decimal}
            min={0}
            max={5}
            step={1}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].value.decimal = v
              })
            }
          />
        </PanelEditItem>
        {/* <PanelEditItem title={t.calc} desc={t.calcTips}>
                <ValueCalculation value={options.value.calc} onChange={v => {
                    onChange((panel: Panel) => { const plugin: PluginSettings = panel.plugins[panel.type];plugin.value.calc = v })
                }} />
            </PanelEditItem> */}
      </PanelAccordion>
      <PanelAccordion title={'MA line'}>
        <PanelEditItem title='Line symbol'>
          <RadionButtons
            options={[
              { label: 'None', value: 'none' },
              { label: 'Circle', value: 'circle' },
              { label: 'Empty Circle', value: 'emptyCircle' },
            ]}
            value={options.maLine.lineSymbol}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].maLine.lineSymbol = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Line width'>
          <EditorNumberItem
            value={options.maLine.lineWidth}
            min={1}
            max={5}
            step={1}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].maLine.lineWidth = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem
          title={'MA5'}
          desc='Draw a line chart, the value of each point is the average of last 5 points (including current point)'
        >
          <Switch
            defaultChecked={options.maLine.ma5}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].maLine.ma5 =
                  e.currentTarget.checked
                // force the panel to rebuild to avoid some problems
                // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={'MA10'}>
          <Switch
            defaultChecked={options.maLine.ma10}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].maLine.ma10 =
                  e.currentTarget.checked
                // force the panel to rebuild to avoid some problems
                // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={'MA20'}>
          <Switch
            defaultChecked={options.maLine.ma20}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].maLine.ma20 =
                  e.currentTarget.checked
                // force the panel to rebuild to avoid some problems
                // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={'MA30'}>
          <Switch
            defaultChecked={options.maLine.ma30}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeCandle].maLine.ma30 =
                  e.currentTarget.checked
                // force the panel to rebuild to avoid some problems
                // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
    </>
  )
})

export default PanelEditor
