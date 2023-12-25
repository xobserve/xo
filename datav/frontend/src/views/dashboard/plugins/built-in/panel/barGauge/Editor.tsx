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

import React, { memo } from 'react'
import PanelAccordion from 'src/views/dashboard/edit-panel/Accordion'
import PanelEditItem from 'src/views/dashboard/edit-panel/PanelEditItem'
import { useStore } from '@nanostores/react'
import { barGaugePanelMsg, commonMsg } from 'src/i18n/locales/en'
import { EditorNumberItem } from 'src/components/editor/EditorItem'
import ValueCalculation from 'src/views/dashboard/plugins/components/ValueCalculation'
import { UnitPicker } from 'src/views/dashboard/plugins/components/UnitPicker'
import RadionButtons from 'src/components/RadioButtons'
import { Switch } from '@chakra-ui/react'
import ThresholdEditor from 'src/views/dashboard/plugins/components/Threshold/ThresholdEditor'
import { Units } from 'types/panel/plugins'
import { CodeEditorModal } from 'src/components/CodeEditor/CodeEditorModal'
import { BarGaugeEditorProps, BarGaugePanel as Panel } from './types'
import { onClickCommonEvent } from 'src/data/panel/initPlugins'
import { isEmpty } from 'utils/validate'

const BarGaugeEditor = memo(({ panel, onChange }: BarGaugeEditorProps) => {
  const t = useStore(commonMsg)
  const t1 = useStore(barGaugePanelMsg)

  if (isEmpty(panel.interactions)) {
    onChange((panel: Panel) => {
      panel.interactions = {
        enableClick: false,
        onClickEvent: onClickCommonEvent,
      }
    })
    return
  }

  return (
    <>
      <PanelAccordion title={t.basicSetting}>
        <PanelEditItem title={t1.orientation} desc={t1.layoutDir}>
          <RadionButtons
            options={[
              { label: t.horizontal, value: 'horizontal' },
              { label: t.vertical, value: 'vertical' },
            ]}
            value={panel.plugins.barGauge.orientation}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.orientation = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t1.displayMode}>
          <RadionButtons
            options={[
              { label: t.basic, value: 'basic' },
              { label: 'Retro LCD', value: 'lcd' },
            ]}
            value={panel.plugins.barGauge.mode}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.mode = v
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
      <PanelAccordion title={t.valueSettings}>
        <PanelEditItem title={t.unit}>
          <UnitPicker
            value={panel.plugins.barGauge.value}
            onChange={(v: Units) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.value.units = v.units
                panel.plugins.barGauge.value.unitsType = v.unitsType
              })
            }
          />
        </PanelEditItem>

        <PanelEditItem title={t.decimal}>
          <EditorNumberItem
            value={panel.plugins.barGauge.value.decimal}
            min={0}
            max={5}
            step={1}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.value.decimal = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t.calc} desc={t.calcTips}>
          <ValueCalculation
            value={panel.plugins.barGauge.value.calc}
            onChange={(v) => {
              onChange((panel: Panel) => {
                panel.plugins.barGauge.value.calc = v
              })
            }}
          />
        </PanelEditItem>
        <PanelEditItem title={t.min} desc={t1.minTips}>
          <EditorNumberItem
            value={panel.plugins.barGauge.min}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.min = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t.max} desc={t1.minTips}>
          <EditorNumberItem
            value={panel.plugins.barGauge.max}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.max = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t1.calcMinFrom}>
          <RadionButtons
            options={[
              { label: t1.allSeries, value: 'all' },
              { label: t1.currentSeries, value: 'series' },
            ]}
            value={panel.plugins.barGauge.maxminFrom}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.maxminFrom = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t1.showMin} desc={t1.showMinTips}>
          <Switch
            isChecked={panel.plugins.barGauge.showMin}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.showMin = e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t1.showMax} desc={t1.showMinTips}>
          <Switch
            isChecked={panel.plugins.barGauge.showMax}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.showMax = e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>

      <PanelAccordion title={t.styles}>
        <PanelEditItem title={t1.showUnfilled} desc={t1.showUnfilledTips}>
          <Switch
            isChecked={panel.plugins.barGauge.style.showUnfilled}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.style.showUnfilled =
                  e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t1.titleSize}>
          <EditorNumberItem
            value={panel.plugins.barGauge.style.titleSize}
            step={1}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.style.titleSize = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t1.valueSize}>
          <EditorNumberItem
            value={panel.plugins.barGauge.style.valueSize}
            step={1}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.barGauge.style.valueSize = v
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>

      <PanelAccordion title={t.interaction}>
        <PanelEditItem title={t.enable}>
          <Switch
            defaultChecked={panel.interactions.enableClick}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.interactions.enableClick = e.currentTarget.checked
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t.onClickEvent} desc={t.onClickEventTips}>
          <CodeEditorModal
            onChange={(v) => {
              onChange((panel: Panel) => {
                panel.interactions.onClickEvent = v
              })
            }}
            value={panel.interactions.onClickEvent}
          />
        </PanelEditItem>
      </PanelAccordion>

      <PanelAccordion title='Thresholds'>
        <ThresholdEditor
          value={panel.plugins.barGauge.thresholds}
          onChange={(v) =>
            onChange((panel: Panel) => {
              panel.plugins.barGauge.thresholds = v
            })
          }
        />
      </PanelAccordion>
    </>
  )
})

export default BarGaugeEditor
