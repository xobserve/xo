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
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import React, { useEffect, useState } from 'react'
import { commonMsg } from 'src/i18n/locales/en'
import Loading from 'src/components/loading/Loading'
import {
  Template,
  TemplateContent,
  TemplateCreateType,
  TemplateScope,
  TemplateType,
} from 'types/template'
import CreateFromTemplate from './CreateFromTemplate'
import { requestApi } from 'utils/axios/request'
import { locale } from 'src/i18n/i18n'
import { navigateTo } from 'utils/url'
import TemplateCard from './TemplateCard'
import { set } from 'lodash'

interface Props {
  scopeId: number
  scopeType: TemplateScope
}

const TemplateList = ({ scopeId, scopeType }: Props) => {
  const t = useStore(commonMsg)
  const lang = useStore(locale)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [templates, setTemplates] = useState<Template[]>(null)
  const [tempTemplate, setTempTemplate] = useState<Template>(null)
  const cancelRef = React.useRef()
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure()
  const {
    isOpen: isRemoveOpen,
    onOpen: onRemoveOpen,
    onClose: onRemoveClose,
  } = useDisclosure()
  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res = await requestApi.get(
      `/template/use/byScope/${scopeType}/${scopeId}`,
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

    toast({
      title: lang == 'zh' ? '引用成功' : 'Created successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    load()

    // setTimeout(() => {
    //   navigateTo(res.data)
    // }, 1000)
  }

  const onRemoveTemplateUse = async () => {
    await requestApi.delete(
      `/template/use/${scopeType}/${scopeId}/${tempTemplate.id}`,
    )
    toast({
      title: lang == 'zh' ? '移除成功.' : 'Removed successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    load()
    onRemoveClose()
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
                        <Button
                          variant='ghost'
                          size='sm'
                          px='0'
                          onClick={() => {
                            setTempTemplate(template)
                            onViewOpen()
                          }}
                        >
                          {lang == 'zh' ? '查看' : 'View'}
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          px='0'
                          ml='2'
                          colorScheme='orange'
                          onClick={() => {
                            setTempTemplate(template)
                            onRemoveOpen()
                          }}
                        >
                          {lang == 'zh' ? '移除引用' : 'Unlink'}
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
        scopeType={scopeType}
        scopeId={scopeId}
        types={[TemplateType.App, TemplateType.Dashboard]}
        isOpen={isOpen}
        onClose={onClose}
        onCreated={onCreateFromTemplate}
        allowClone={scopeType == TemplateScope.Team}
      />

      <Modal isOpen={isViewOpen} onClose={onViewClose}>
        <ModalOverlay />
        <ModalContent minWidth={500}>
          <ModalBody>
            <TemplateCard template={tempTemplate} width='100%' height={500} />
          </ModalBody>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={isRemoveOpen}
        leastDestructiveRef={cancelRef}
        onClose={onRemoveClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {lang == 'zh' ? '移除模版引用' : 'Unlink template'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {lang == 'zh'
                ? '确定要移除模版引用吗？'
                : 'Are you sure you want to remove the reference to  this template?'}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRemoveClose}>
                {t.cancel}
              </Button>
              <Button colorScheme='red' onClick={onRemoveTemplateUse} ml={3}>
                {lang == 'zh' ? '移除' : 'Unlink'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default TemplateList
