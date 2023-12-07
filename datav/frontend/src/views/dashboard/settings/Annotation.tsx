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
import { useStore } from '@nanostores/react'
import { ColorPicker } from 'src/components/ColorPicker'
import { Form, FormSection } from 'src/components/form/Form'
import FormItem from 'src/components/form/Item'
import React from 'react'
import { initDashboard } from 'src/data/dashboard'
import { commonMsg } from 'src/i18n/locales/en'
import { Dashboard } from 'types/dashboard'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import RadionButtons from 'src/components/RadioButtons'
import { Role } from 'types/role'
import { locale } from 'src/i18n/i18n'
import { Lang } from 'types/misc'

interface Props {
  dashboard: Dashboard
  onChange: any
}

const AnnotationSettings = ({ dashboard, onChange }: Props) => {
  const t = useStore(commonMsg)
  const lang = useStore(locale)
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
          desc={
            lang == Lang.EN ? 'Color for annotation markers' : '注解标记的颜色'
          }
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
          title={lang == Lang.EN ? 'Who can edit' : '谁能编辑'}
          labelWidth='100px'
          desc={
            lang == Lang.EN
              ? 'Control which team role can add,edit and delete annotations'
              : '控制哪些团队角色可以添加、编辑和删除注解'
          }
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

      <FormSection title={lang == Lang.EN ? 'filter' : '过滤'} spacing={1}>
        <FormItem
          title={t.tags}
          labelWidth='100px'
          desc={
            lang == Lang.EN
              ? 'Annotation which has one of below tags will be show, leave empty to show all'
              : '拥有以下标签的注解将被显示，留空则显示所有'
          }
        >
          <EditorInputItem
            value={dashboard.data.annotation.tagsFilter}
            onChange={(v: string) =>
              onChange((draft: Dashboard) => {
                draft.data.annotation.tagsFilter = v.trim()
              })
            }
            placeholder={
              lang == Lang.EN
                ? 'split with comma e.g: warn,error,critical'
                : '用逗号分隔，例如：warn,error,critical'
            }
          />
        </FormItem>
      </FormSection>
    </Form>
  )
}

export default AnnotationSettings
