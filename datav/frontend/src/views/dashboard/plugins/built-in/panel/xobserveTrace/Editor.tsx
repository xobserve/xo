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

import PanelAccordion from 'src/views/dashboard/edit-panel/Accordion'
import React from 'react'
import { useStore } from '@nanostores/react'
import { commonMsg } from 'src/i18n/locales/en'
import PanelEditItem from 'src/views/dashboard/edit-panel/PanelEditItem'
import { Switch } from '@chakra-ui/react'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import { dispatch } from 'use-bus'
import { PanelForceRebuildEvent } from 'src/data/bus-events'
import { ClickActionsEditor } from 'src/views/dashboard/edit-panel/components/ClickActionsEditor'
import { PanelType, TraceEditorProps, TracePanel as Panel } from './types'
import { ErrorOkChartEditor } from '../../../components/charts/ErrorOkChart'
import { isEmpty } from 'utils/validate'

const TracePanelEditor = ({ panel, onChange }: TraceEditorProps) => {
  const t = useStore(commonMsg)
  if (isEmpty(panel.interactions)) {
    onChange((panel: Panel) => {
      panel.interactions = {
        enableClick: false,
        clickActions: [],
      }
    })
    return
  }

  return (
    <>
      {panel.templateId == 0 && (
        <>
          <PanelAccordion title={t.basic}>
            <PanelEditItem title='Default service'>
              <EditorInputItem
                value={panel.plugins[PanelType].defaultService}
                onChange={(v) =>
                  onChange((panel: Panel) => {
                    panel.plugins[PanelType].defaultService = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                  })
                }
              />
            </PanelEditItem>
            <PanelEditItem
              title='Enable edit service'
              desc='when diabled, service will be automatically set to default service'
            >
              <Switch
                isChecked={panel.plugins[PanelType].enableEditService}
                onChange={(e) =>
                  onChange((panel: Panel) => {
                    panel.plugins[PanelType].enableEditService =
                      e.target.checked
                  })
                }
              />
            </PanelEditItem>
            <PanelEditItem title='Default operation'>
              <EditorInputItem
                value={panel.plugins[PanelType].defaultOperation}
                onChange={(v) =>
                  onChange((panel: Panel) => {
                    panel.plugins[PanelType].defaultOperation = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                  })
                }
              />
            </PanelEditItem>
            <PanelEditItem title='Enable edit operation'>
              <Switch
                isChecked={panel.plugins[PanelType].enableEditOperation}
                onChange={(e) =>
                  onChange((panel: Panel) => {
                    panel.plugins[PanelType].enableEditOperation =
                      e.target.checked
                  })
                }
              />
            </PanelEditItem>
          </PanelAccordion>
          <ErrorOkChartEditor
            panel={panel}
            panelType={PanelType}
            onChange={onChange}
          />
        </>
      )}
      <PanelAccordion title={t.interaction}>
        <PanelEditItem title={t.enable}>
          <Switch
            isChecked={panel.interactions.enableClick}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.interactions.enableClick = e.target.checked
              })
            }
          />
        </PanelEditItem>
        {panel.interactions.enableClick && (
          <ClickActionsEditor
            panel={panel}
            onChange={(v) => {
              onChange((panel: Panel) => {
                panel.interactions.clickActions = v
              })
            }}
            actions={panel.interactions.clickActions}
          />
        )}
      </PanelAccordion>
    </>
  )
}

export default TracePanelEditor
