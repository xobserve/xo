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
import { PanelType, TraceEditorProps, TracePanel as Panel } from './types'
import { ErrorOkChartEditor } from '../../../components/charts/ErrorOkChart'

const TracePanelEditor = ({ panel, onChange }: TraceEditorProps) => {
  const t = useStore(commonMsg)
  return (
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
                panel.plugins[PanelType].enableEditService = e.target.checked
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
                panel.plugins[PanelType].enableEditOperation = e.target.checked
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
      <PanelAccordion title={t.interaction}>
        <PanelEditItem title={t.enable}>
          <Switch
            isChecked={panel.plugins[PanelType].interaction.enable}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelType].interaction.enable = e.target.checked
              })
            }
          />
        </PanelEditItem>
        {panel.plugins[PanelType].interaction.enable && (
          <ClickActionsEditor
            panel={panel}
            onChange={(v) => {
              onChange((panel: Panel) => {
                panel.plugins[PanelType].interaction.actions = v
              })
            }}
            actions={panel.plugins[PanelType].interaction.actions}
          />
        )}
      </PanelAccordion>
      <ErrorOkChartEditor
        panel={panel}
        panelType={PanelType}
        onChange={onChange}
      />
      <PanelAccordion title={t.interaction}>
        <PanelEditItem title={t.enable}>
          <Switch
            isChecked={panel.plugins[PanelType].interaction.enable}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins[PanelType].interaction.enable = e.target.checked
              })
            }
          />
        </PanelEditItem>
        {panel.plugins[PanelType].interaction.enable && (
          <ClickActionsEditor
            panel={panel}
            onChange={(v) => {
              onChange((panel: Panel) => {
                panel.plugins[PanelType].interaction.actions = v
              })
            }}
            actions={panel.plugins[PanelType].interaction.actions}
          />
        )}
      </PanelAccordion>
    </>
  )
}

export default TracePanelEditor
