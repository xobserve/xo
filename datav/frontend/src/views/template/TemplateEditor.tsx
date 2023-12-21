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

import { Box, Button, Textarea, useToast } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import { Input, InputNumber } from 'antd'
import RadionButtons from 'components/RadioButtons'
import { FormSection } from 'components/form/Form'
import FormItem from 'components/form/Item'
import { MarkdownRender } from 'components/markdown/MarkdownRender'
import { cloneDeep } from 'lodash'
import React, { useState } from 'react'
import { $config } from 'src/data/configs/config'
import { locale } from 'src/i18n/i18n'
import { commonMsg } from 'src/i18n/locales/en'
import { Template, TemplateScope, TemplateType } from 'types/template'
import { requestApi } from 'utils/axios/request'
import { isEmpty } from 'utils/validate'

interface Props {
  template?: Template
  onChange?: any
}

const initTemplate: Partial<Template> = {
  type: TemplateType.Dashboard,
  scope: TemplateScope.Website,
  description: '',
}

const TemplateEditor = (props: Props) => {
  const lang = useStore(locale)
  const t = useStore(commonMsg)
  const toast = useToast()
  const config = useStore($config)

  const isCreate = isEmpty(props.template)

  const [template, setTemplate] = useState<Partial<Template>>(
    cloneDeep(props.template) ?? initTemplate,
  )
  const [isPreview, setIsPreview] = useState(false)

  const onSubmitTemplate = async () => {
    if (isEmpty(template.title) || isEmpty(template.description)) {
      toast({
        title: t.requiredFieldTips,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (isCreate) {
      await requestApi.post('/template/create', template)
    } else {
      await requestApi.post('/template/update', template)
    }

    toast({
      title: lang == 'zh' ? '模版已保存' : 'Template saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    props.onChange && props.onChange(template)
  }

  return (
    <Box
      sx={{
        '.form-item-label': {
          width: '120px',
        },
      }}
      maxW={600}
    >
      <FormSection>
        <FormItem title={t.itemName({ name: t.template })} required>
          <InputNumber
            value={template.id}
            placeholder='auto'
            onChange={(v) => {
              setTemplate({
                ...template,
                id: v,
              })
            }}
            disabled={!isCreate}
          />
        </FormItem>
        <FormItem title={t.itemName({ name: t.template })} required>
          <Input
            value={template.title}
            placeholder={t.inputTips({ name: t.name })}
            onChange={(e) => {
              setTemplate({
                ...template,
                title: e.target.value,
              })
            }}
          />
        </FormItem>
        <FormItem title={t.description} desc={t.supportMarkdown} required>
          <Box>
            <RadionButtons
              theme='brand'
              options={[
                {
                  label: t.edit,
                  value: 'edit',
                },
                {
                  label: t.preview,
                  value: 'preview',
                },
              ]}
              onChange={(v) => setIsPreview(v == 'preview')}
              value={isPreview ? 'preview' : 'edit'}
            />
            {!isPreview ? (
              <Textarea
                rows={10}
                value={template.description}
                placeholder={t.inputTips({ name: t.description })}
                width={500}
                onChange={(e) => {
                  setTemplate({
                    ...template,
                    description: e.target.value,
                  })
                }}
              />
            ) : (
              <MarkdownRender
                width='500px'
                md={template.description}
                height={'100%'}
                fontSize='0.9rem'
              />
            )}
          </Box>
        </FormItem>
        <FormItem
          title={t.type}
          desc={
            lang == 'zh'
              ? '应用模版由侧边菜单、多个仪表盘以及相关的数据源组成'
              : 'App template is consist of a sidemenu, several dashboards and relative datasources'
          }
        >
          <RadionButtons
            value={template.type.toString()}
            onChange={(v) =>
              setTemplate({
                ...template,
                type: Number(v),
              })
            }
            options={[
              { label: t.app, value: TemplateType.App.toString() },
              { label: t.dashboard, value: TemplateType.Dashboard.toString() },
              { label: t.panel, value: TemplateType.Panel.toString() },
            ]}
            disabled={!isCreate}
          />
        </FormItem>
        <FormItem
          title={t.visibleTo}
          desc={
            lang == 'zh'
              ? '租户和团队都是指当前正在使用的'
              : 'Tenant and Team refer to the ones that you are using'
          }
        >
          <RadionButtons
            value={template.scope.toString()}
            onChange={(v) =>
              setTemplate({
                ...template,
                scope: Number(v),
                ownedBy:
                  v == TemplateScope.Team.toString()
                    ? config.currentTeam
                    : v == TemplateScope.Tenant.toString()
                    ? config.currentTenant
                    : 0,
              })
            }
            options={[
              { label: t.all, value: TemplateScope.Website.toString() },
              { label: t.tenant, value: TemplateScope.Tenant.toString() },
              { label: t.team, value: TemplateScope.Team.toString() },
            ]}
            disabled={!isCreate}
          />
        </FormItem>
      </FormSection>
      <Button onClick={onSubmitTemplate} size='sm' mt='2'>
        {t.submit}
      </Button>
    </Box>
  )
}

export default TemplateEditor
