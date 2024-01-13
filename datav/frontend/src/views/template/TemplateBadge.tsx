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

import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Tag,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import { set } from 'lodash'
import React, { useState } from 'react'
import { locale } from 'src/i18n/i18n'
import { Template } from 'types/template'
import { requestApi } from 'utils/axios/request'
import TemplateCard from './TemplateCard'

interface Props {
  templateId: number
  unlinkTemplate?: any
}

const TemplateBadge = ({ templateId, unlinkTemplate = null }: Props) => {
  const lang = useStore(locale)
  const [template, setTemplate] = useState<Template>(null)
  const onOpen = async () => {
    if (template) {
      return
    }

    const res = await requestApi.get(`/template/byId/${templateId}`)
    setTemplate(res.data)
  }

  return (
    <>
      <Popover onOpen={onOpen} trigger='hover' placement='right'>
        <PopoverTrigger>
          <Tag
            size='sm'
            variant='subtle'
            paddingInlineStart='4px'
            paddingInlineEnd='4px'
            minW='auto'
            minH='14px'
            borderRadius={1}
          >
            T
          </Tag>
        </PopoverTrigger>
        <Portal>
          <PopoverContent minW='500px'>
            <PopoverArrow />
            <PopoverHeader
              justifyContent='space-between'
              display='flex'
              alignItems='center'
            >
              {lang == 'zh'
                ? '对象引用了以下模版'
                : 'This object refers to below template'}

              {unlinkTemplate && (
                <Button size='md' variant='outline' onClick={unlinkTemplate}>
                  {lang == 'zh' ? '取消模版引用' : 'Unlink'}
                </Button>
              )}
            </PopoverHeader>
            <PopoverBody>
              {template && <TemplateCard template={template} width='100%' />}
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  )
}

export default TemplateBadge
