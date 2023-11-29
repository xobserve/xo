// Copyright 2023 xObserve.io Team

import { EditorInputItem } from 'src/components/editor/EditorItem'
import RadionButtons from 'src/components/RadioButtons'
import PanelAccordion from 'src/views/dashboard/edit-panel/Accordion'
import PanelEditItem from 'src/views/dashboard/edit-panel/PanelEditItem'
import React, { memo } from 'react'
import { useStore } from '@nanostores/react'
import { PanelType, TextEditorProps, TextPanel as Panel } from './types'
import CodeEditor from 'components/CodeEditor/CodeEditor'
import { locale } from 'src/i18n/i18n'

const TextPanelEditor = memo(({ panel, onChange }: TextEditorProps) => {
  const lang = useStore(locale)
  return (
    <PanelAccordion title={lang == 'en' ? 'Text settings' : 'Text 设置'}>
      <PanelEditItem title={lang == 'en' ? 'Content' : '内容'}>
        <CodeEditor
          value={panel.plugins[PanelType].md}
          onChange={(v) => {
            onChange((panel: Panel) => {
              panel.plugins[PanelType].md = v
            })
          }}
          language='markdown'
          height='240px'
        />
      </PanelEditItem>

      <PanelEditItem
        title={lang == 'en' ? 'Horizontal position' : '文字水平位置'}
      >
        <RadionButtons
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ]}
          value={panel.plugins[PanelType].justifyContent}
          onChange={(v) =>
            onChange((panel: Panel) => {
              panel.plugins[PanelType].justifyContent = v
            })
          }
        />
      </PanelEditItem>

      <PanelEditItem
        title={lang == 'en' ? 'Vertical position' : '文字竖直位置'}
      >
        <RadionButtons
          options={[
            { label: 'Top', value: 'top' },
            { label: 'Center', value: 'center' },
            { label: 'Bottom', value: 'end' },
          ]}
          value={panel.plugins[PanelType].alignItems}
          onChange={(v) =>
            onChange((panel: Panel) => {
              panel.plugins[PanelType].alignItems = v
            })
          }
        />
      </PanelEditItem>

      <PanelEditItem title='Font size'>
        <EditorInputItem
          value={panel.plugins[PanelType].fontSize}
          onChange={(v) =>
            onChange((panel: Panel) => {
              panel.plugins[PanelType].fontSize = v
            })
          }
        />
      </PanelEditItem>

      <PanelEditItem title='Font weight'>
        <EditorInputItem
          value={panel.plugins[PanelType].fontWeight}
          onChange={(v) =>
            onChange((panel: Panel) => {
              panel.plugins[PanelType].fontWeight = v
            })
          }
        />
      </PanelEditItem>
    </PanelAccordion>
  )
})

export default TextPanelEditor
