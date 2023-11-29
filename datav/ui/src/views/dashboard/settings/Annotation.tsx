// Copyright 2023 xObserve.io Team

import { Switch } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import { ColorPicker } from 'src/components/ColorPicker'
import { Form, FormSection } from 'src/components/form/Form'
import FormItem from 'src/components/form/Item'
import React from 'react'
import { initDashboard } from 'src/data/dashboard'
import { commonMsg, dashboardSettingMsg } from 'src/i18n/locales/en'
import { Dashboard } from 'types/dashboard'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import RadionButtons from 'src/components/RadioButtons'
import { Role } from 'types/role'

interface Props {
  dashboard: Dashboard
  onChange: any
}

const AnnotationSettings = ({ dashboard, onChange }: Props) => {
  const t = useStore(commonMsg)
  const t1 = useStore(dashboardSettingMsg)
  return (
    <Form>
      <FormSection title={t.basicSetting} spacing={1}>
        <FormItem title={t.enable} alignItems='center' labelWidth='100px'>
          <Switch
            isChecked={dashboard.data.annotation.enable}
            onChange={(e) =>
              onChange((draft: Dashboard) => {
                draft.data.annotation.enable = e.currentTarget.checked
              })
            }
          />
        </FormItem>
        <FormItem
          title={t.color}
          labelWidth='100px'
          desc='Color for annotation markers'
        >
          <ColorPicker
            color={dashboard.data.annotation.color}
            onChange={(v) =>
              onChange((draft: Dashboard) => {
                draft.data.annotation.color = v
              })
            }
            presetColors={[
              {
                value: initDashboard().data.annotation.color,
                label: 'Default',
              },
            ]}
            circlePicker
          />
        </FormItem>
        <FormItem
          title='Who can edit'
          labelWidth='100px'
          desc='Control which role can add,edit and delete annotations'
        >
          <RadionButtons
            options={[
              { label: Role.Viewer, value: Role.Viewer },
              { label: Role.ADMIN, value: Role.ADMIN },
            ]}
            value={dashboard.data.annotation.enableRole}
            onChange={(v) =>
              onChange((draft: Dashboard) => {
                draft.data.annotation.enableRole = v
              })
            }
          />
        </FormItem>
      </FormSection>

      <FormSection title='Filter' spacing={1}>
        <FormItem
          title={t.tags}
          labelWidth='100px'
          desc='Annotation which has one of below tags will be show, leave empty to show all'
        >
          <EditorInputItem
            value={dashboard.data.annotation.tagsFilter}
            onChange={(v: string) =>
              onChange((draft: Dashboard) => {
                draft.data.annotation.tagsFilter = v.trim()
              })
            }
            placeholder='split with comma e.g: warn,error,critical'
          />
        </FormItem>
      </FormSection>
    </Form>
  )
}

export default AnnotationSettings
