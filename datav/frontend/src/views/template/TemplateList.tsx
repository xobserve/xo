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
  HStack,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import React, { useEffect, useState } from 'react'
import { commonMsg } from 'src/i18n/locales/en'
import Loading from 'src/components/loading/Loading'
import {
  Template,
  TemplateContent,
  TemplateCreateType,
  TemplateType,
} from 'types/template'
import CreateFromTemplate from './CreateFromTemplate'
import { requestApi } from 'utils/axios/request'
import { locale } from 'src/i18n/i18n'
import TemplateCard from './TemplateCard'
import { Scope } from 'types/scope'
import { getScopeText } from 'utils/scope'

interface Props {
  scopeId: number
  scopeType: Scope
  reload?: any
}

const TemplateList = ({ scopeId, scopeType, reload = null }: Props) => {
  const t = useStore(commonMsg)
  const lang = useStore(locale)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [templates, setTemplates] = useState<Template[]>(null)
  const [tempTemplate, setTempTemplate] = useState<Template>(null)
  const [removeType, setRemoveType] = useState<'all' | 'unlink'>(null)
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
      title:
        lang == 'zh'
          ? '引用成功, 重载页面...'
          : 'Created successfully, reloading...',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    // load()
    // reload && reload()

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const onSyncTemplate = async (
    templateId: number,
    createType: TemplateCreateType,
  ) => {
    const res = await requestApi.post(`/template/sync`, {
      scopeId,
      scopeType,
      templateId: templateId,
      type: createType,
    })

    toast({
      title:
        lang == 'zh'
          ? '引用成功, 重载页面...'
          : 'Created successfully, reloading...',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    // load()
    // reload && reload()

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const onRemoveTemplateUse = async () => {
    await requestApi.delete(
      `/template/use/${scopeType}/${scopeId}/${tempTemplate.id}/${removeType}`,
    )
    toast({
      title: lang == 'zh' ? '移除成功.' : 'Removed successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    // load()
    // reload && reload()
    // onRemoveClose()
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const onDisableTemplate = async (templateId: number) => {
    await requestApi.post(`/template/disable`, {
      scopeId,
      scopeType,
      templateId: templateId,
    })
    toast({
      title: lang == 'zh' ? '禁用成功.' : 'Disabled successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const onEnableTemplate = async (templateId: number) => {
    await requestApi.post(`/template/enable`, {
      scopeId,
      scopeType,
      templateId: templateId,
    })
    toast({
      title: lang == 'zh' ? '启用成功.' : 'Enable successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      window.location.reload()
    }, 1000)
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
                  <Th>{lang == 'zh' ? '来源' : 'Source'}</Th>
                  <Th>{t.status}</Th>
                  <Th>{t.action}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {templates?.map((template) => {
                  const scopeText = getScopeText(template.scope, lang)
                  const isInherited = template.scope != scopeType
                  return (
                    <Tr key={template.id}>
                      <Td>{template.id}</Td>
                      <Td>{template.title}</Td>
                      <Td>
                        {!isInherited
                          ? lang == 'zh'
                            ? '当前' + scopeText
                            : 'Current ' + scopeText
                          : lang == 'zh'
                          ? '继承自' + scopeText
                          : 'Inherited from ' + scopeText}
                      </Td>
                      <Td color={template.disabled ? 'red' : 'green'}>
                        {template.disabled
                          ? lang == 'zh'
                            ? '已禁用'
                            : 'Disabled'
                          : lang == 'zh'
                          ? '已启用'
                          : 'Enabled'}
                      </Td>
                      <Td>
                        <HStack spacing={3}>
                          <Button
                            variant='solid'
                            size='sm'
                            // px='0'
                            onClick={() => {
                              setTempTemplate(template)
                              onViewOpen()
                            }}
                          >
                            {lang == 'zh' ? '查看' : 'View'}
                          </Button>
                          {/* <Button
                            variant='ghost'
                            size='sm'
                            px='0'
                            colorScheme='orange'
                            onClick={() => {
                              setTempTemplate(template)
                              setRemoveType('unlink')
                              onRemoveOpen()
                            }}
                          >
                            {lang == 'zh' ? '移除引用' : 'Unlink'}
                          </Button> */}

                          {!isInherited && (
                            <Button
                              variant='outline'
                              size='sm'
                              // px='0'
                              colorScheme='red'
                              onClick={() => {
                                setTempTemplate(template)
                                setRemoveType('all')
                                onRemoveOpen()
                              }}
                            >
                              {lang == 'zh'
                                ? '移除模版及相关资源'
                                : 'Unlink template and remove resources'}
                            </Button>
                          )}
                          {scopeType == Scope.Team && !template.disabled && (
                            <Button
                              variant='outline'
                              size='sm'
                              // px='0'
                              onClick={() => {
                                onSyncTemplate(
                                  template.id,
                                  TemplateCreateType.Refer,
                                )
                              }}
                            >
                              {lang == 'zh' ? '再次同步' : 'Sync again'}
                            </Button>
                          )}

                          {isInherited && scopeType == Scope.Team && (
                            <Button
                              variant='outline'
                              size='sm'
                              // px='0'
                              colorScheme={template.disabled ? 'brand' : 'red'}
                              onClick={() => {
                                template.disabled
                                  ? onEnableTemplate(template.id)
                                  : onDisableTemplate(template.id)
                              }}
                            >
                              {lang == 'zh'
                                ? template.disabled
                                  ? '启用模版'
                                  : '禁用模版'
                                : !template.disabled
                                ? 'Enable template'
                                : 'Disable template'}
                            </Button>
                          )}
                        </HStack>
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
        allowClone={scopeType == Scope.Team}
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
              {removeType == 'all'
                ? lang == 'zh'
                  ? '移除模版及相关资源'
                  : 'Unlink template and remove resources'
                : lang == 'zh'
                ? '移除模版引用'
                : 'Unlink template'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {removeType == 'all'
                ? lang == 'zh'
                  ? '确定要移除模版及相关资源吗？'
                  : 'Are you sure you want to remove the template and related resources?'
                : lang == 'zh'
                ? '确定要移除模版吗？'
                : 'Are you sure you want to remove the reference to  this template?'}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRemoveClose}>
                {t.cancel}
              </Button>
              <Button colorScheme='red' onClick={onRemoveTemplateUse} ml={3}>
                {removeType == 'all'
                  ? lang == 'zh'
                    ? '移除所有'
                    : 'Remove all'
                  : lang == 'zh'
                  ? '移除'
                  : 'Unlink'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default TemplateList
