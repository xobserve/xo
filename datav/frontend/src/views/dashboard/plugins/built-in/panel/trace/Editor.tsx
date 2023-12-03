// Copyright 2023 xObserve.io Team

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
import { TraceEditorProps, TracePanel as Panel, PanelTypeTrace } from './types'

const TracePanelEditor = ({ panel, onChange }: TraceEditorProps) => {
  const t = useStore(commonMsg)
  return (
    <>
      <PanelAccordion title={t.basic}>
        <PanelEditItem title='Default service'>
          <EditorInputItem
            value={panel.plugins.trace.defaultService}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.trace.defaultService = v
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
            isChecked={panel.plugins.trace.enableEditService}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins.trace.enableEditService = e.target.checked
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Default operation'>
          <EditorInputItem
            value={panel.plugins[PanelTypeTrace].defaultOperation}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeTrace].defaultOperation = v
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title='Enable edit operation'>
          <Switch
            isChecked={panel.plugins[PanelTypeTrace].enableEditOperation}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelTypeTrace].enableEditOperation =
                  e.target.checked
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
      <PanelAccordion title={t.interaction}>
        <PanelEditItem title={t.enable}>
          <Switch
            isChecked={panel.plugins.trace.interaction.enable}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins.trace.interaction.enable = e.target.checked
              })
            }
          />
        </PanelEditItem>
        {panel.plugins.trace.interaction.enable && (
          <ClickActionsEditor
            panel={panel}
            onChange={(v) => {
              onChange((panel: Panel) => {
                panel.plugins.trace.interaction.actions = v
              })
            }}
            actions={panel.plugins.trace.interaction.actions}
          />
        )}
      </PanelAccordion>
    </>
  )
}

export default TracePanelEditor
