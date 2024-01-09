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
  Box,
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Flex,
  useDisclosure,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import React, { useEffect, useState } from 'react'
import { commonMsg } from 'src/i18n/locales/en'
import Loading from 'src/components/loading/Loading'
import {
  Template,
  TemplateContent,
  TemplateCreateType,
  TemplateData,
  TemplateScope,
  TemplateType,
} from 'types/template'
import CreateFromTemplate from './CreateFromTemplate'
import { requestApi } from 'utils/axios/request'
import { locale } from 'src/i18n/i18n'

interface Props {
  scopeId: number
  scopeType: TemplateScope
}

const TemplateList = ({ scopeId, scopeType }: Props) => {
  const t = useStore(commonMsg)
  const lang = useStore(locale)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [templates, setTemplates] = useState<Template[]>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await requestApi.get(
      `/template/byScope/${scopeType}/${scopeId}`,
    )
    setTemplates(res.data)
  }

  const onCreateFromTemplate = async (
    templateContent: TemplateContent,
    createType: TemplateCreateType,
  ) => {
    const res = await requestApi.post(`/template/use`, {
      scopeId,
      scopeType,
      templateId: templateContent.templateId,
      type: createType,
    })
  }

  return (
    <>
      <Box>
        <Flex justifyContent='space-between'>
          <Box></Box>
          <Button
            size='sm'
            onClick={() => {
              onOpen()
            }}
          >
            {lang == 'zh' ? '使用模版' : 'Use template'}
          </Button>
        </Flex>
        {templates ? (
          <TableContainer>
            <Table variant='simple' className='color-border-table'>
              <Thead>
                <Tr>
                  <Th>Id</Th>
                  <Th>{t.name}</Th>
                  <Th>{t.action}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {templates?.map((template) => {
                  return (
                    <Tr key={template.id}>
                      <Td>{template.id}</Td>
                      <Td>{template.title}</Td>
                      <Td>
                        <Button variant='ghost' size='sm' px='0'>
                          {t.manage}
                        </Button>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Loading style={{ marginTop: '50px' }} />
        )}
      </Box>
      <CreateFromTemplate
        types={[TemplateType.App, TemplateType.Dashboard]}
        isOpen={isOpen}
        onClose={onClose}
        onCreated={onCreateFromTemplate}
      />
    </>
  )
}

export default TemplateList
