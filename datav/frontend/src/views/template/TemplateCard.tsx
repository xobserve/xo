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
  Flex,
  HStack,
  Text,
  Button,
  Tag,
  useColorMode,
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from '@chakra-ui/react'
import { Dropdown, MenuProps, Tooltip } from 'antd'
import CodeEditor from 'components/CodeEditor/CodeEditor'
import { MarkdownRender } from 'components/markdown/MarkdownRender'
import { cloneDeep } from 'lodash'
import moment from 'moment'
import React, { useState } from 'react'
import {
  FaEdit,
  FaEllipsisV,
  FaPlus,
  FaProjectDiagram,
  FaRegClone,
  FaTerminal,
} from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { locale } from 'src/i18n/i18n'
import { commonMsg } from 'src/i18n/locales/en'
import {
  Template,
  TemplateContent,
  TemplateScope,
  TemplateType,
} from 'types/template'
import { requestApi } from 'utils/axios/request'
import { prettyJson } from 'utils/string'

interface Props {
  template: Template
  width: any
  height?: number
  onEdit?: () => void
  onCreateContent?: () => void
  onPush?: () => void
  selected?: boolean
}

const TemplateCard = (props: Props) => {
  const {
    width,
    height = 300,
    onEdit = null,
    onCreateContent = null,
    onPush = null,
    selected = false,
  } = props
  const lang = locale.get()
  const t = commonMsg.get()
  const { colorMode } = useColorMode()
  const [onHover, setOnHover] = useState(false)
  const [template, setTemplate] = useState<Template>(props.template)
  const [contents, setContents] = useState<TemplateContent[]>(null)
  const [viewContent, setViewContent] = useState<TemplateContent>(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure()
  const toast = useToast()

  let scope = lang == 'zh' ? '全部' : 'All'
  let scopeTips =
    lang == 'zh'
      ? '该模版是公共模版，对全部租户都可见'
      : 'This template is public and visible to all tenants'
  if (template.scope == TemplateScope.Tenant) {
    scope = lang == 'zh' ? '租户' : 'Tenant'
    scopeTips =
      lang == 'zh'
        ? '该模版由当前租户创建，仅对当前租户可见'
        : 'This template is created by current tenant and only visible to current tenant'
  } else if (template.scope == TemplateScope.Team) {
    scope = lang == 'zh' ? '团队' : 'Team'
    scopeTips =
      lang == 'zh'
        ? '该模版由当前团队模版，仅对当前团队可见'
        : 'This template is created by current team and only visible to current team'
  }

  const onDisplayVersions = async () => {
    const res = await requestApi.get(`/template/contents/${template.id}`)
    setContents(res.data)
    onOpen()
  }

  const onUseContent = async (contentId) => {
    await requestApi.post(`/template/content/use`, {
      contentId: contentId,
      templateId: template.id,
    })
    toast({
      title: lang == 'zh' ? '新版本模版已应用' : 'New version applied',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    template.contentId = contentId
    setTemplate(cloneDeep(template))
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'version',
      icon: <FaTerminal />,
      label: lang == 'zh' ? '设定当前使用的版本' : 'Set current version',
      onClick: onDisplayVersions,
    },
    {
      type: 'divider',
    },
    onCreateContent && {
      key: 'createContent',
      icon: <FaPlus />,
      label: lang == 'zh' ? '创建新版本' : 'Create new version',
      onClick: onCreateContent,
    },
    onEdit && {
      key: 'edit',
      icon: <MdEdit />,
      label: lang == 'zh' ? '编辑模版' : 'Edit template',
      onClick: onEdit,
    },

    onPush && {
      type: 'divider',
    },
    onPush && {
      key: 'push',
      icon: <FaRegClone />,
      label: lang == 'zh' ? '基于克隆创建' : 'Create from clone',
      onClick: () => {
        if (
          template.type == TemplateType.Panel ||
          template.type == TemplateType.Dashboard
        ) {
          toast({
            title:
              lang == 'zh'
                ? '请在创建图表处使用模版'
                : 'Please use template in the place of creating panel',
            status: 'info',
            duration: 3000,
            isClosable: true,
          })

          return
        }
      },
    },
    onPush && {
      key: 'ref',
      icon: <FaProjectDiagram />,
      label: lang == 'zh' ? '基于引用创建' : 'Create from reference',
      onClick: () => {
        if (
          template.type == TemplateType.Panel ||
          template.type == TemplateType.Dashboard
        ) {
          toast({
            title:
              lang == 'zh'
                ? '请在创建图表处使用模版'
                : 'Please use template in the place of creating panel',
            status: 'info',
            duration: 3000,
            isClosable: true,
          })

          return
        }
      },
    },
  ]

  const onViewContent = async (id) => {
    const res = await requestApi.get(`/template/content/${id}`)
    setViewContent(res.data)
    onViewOpen()
  }
  return (
    <>
      <Flex
        className={`${colorMode == 'dark' ? '' : 'bordered'} panel-bg ${
          selected && 'highlight-bordered'
        }`}
        width={width}
        flexDirection='column'
        height={height}
        py='2'
        px='4'
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
        position='relative'
      >
        <HStack>
          <Text fontWeight={500} fontSize='1.1rem'>
            {template.title}
          </Text>
          <Tooltip title={scopeTips}>
            <Tag size='sm' variant='subtle'>
              {scope}
            </Tag>
          </Tooltip>
          {!template.contentId ? (
            <Tooltip
              title={
                lang == 'zh'
                  ? '该模版尚未设定关联的内容，使用它将无任何效果'
                  : 'This template has not selected any contents version, so use it will has no effect'
              }
            >
              <Tag size='sm' variant='subtle' colorScheme='orange'>
                {lang == 'zh' ? '未设版本' : 'No version'}
              </Tag>
            </Tooltip>
          ) : (
            <Tag size='sm' variant='subtle'>
              v{template.version}
            </Tag>
          )}
        </HStack>
        <MarkdownRender
          md={template.description}
          fontSize='0.9rem'
          maxH={height - 50}
          width='100%'
          mt='4'
        />
        {onEdit && onCreateContent && onPush && (
          <HStack
            position='absolute'
            right='2'
            top='9px'
            opacity={onHover ? 1 : 0}
            spacing={3}
            transition='opacity 0.4s'
          >
            <Dropdown
              placement='bottom'
              menu={{
                mode: 'inline',
                items: menuItems,
              }}
              trigger={['hover']}
              overlayStyle={{}}
            >
              <Button
                height={'100%'}
                transition='all 0.2s'
                onClick={(e) => e.preventDefault()}
                variant='ghost'
                size='xs'
                visibility={onHover ? 'visible' : 'hidden'}
              >
                <Box
                  padding={1}
                  opacity='0.6'
                  fontSize='0.8rem'
                  cursor='pointer'
                >
                  <FaEllipsisV />
                </Box>
                {/* </Center> */}
              </Button>
            </Dropdown>
          </HStack>
        )}
      </Flex>
      {contents && (
        <Drawer placement='right' size='lg' onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>
              {lang == 'zh' ? '设定当前使用的模版版本' : ''} - {template.title}
            </DrawerHeader>
            <DrawerBody>
              {contents.map((c) => (
                <Flex
                  key={c.id}
                  justifyContent='space-between'
                  alignItems='center'
                  py='2'
                  px='4'
                  borderBottomWidth='1px'
                >
                  <Box>
                    <Text>v{c.version}</Text>
                    <HStack fontSize='0.95rem' opacity={0.7} mt='1'>
                      <Text>{moment(c.created).format('YY-MM-DD HH:mm')}</Text>
                      <Text>·</Text>
                      <Text>{c.description}</Text>
                    </HStack>
                  </Box>
                  <HStack>
                    {template.contentId != c.id ? (
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => {
                          onUseContent(c.id)
                        }}
                      >
                        {lang == 'zh' ? '使用' : 'Use'}
                      </Button>
                    ) : (
                      <Tag size='sm' variant='subtle'>
                        {lang == 'zh' ? '当前使用' : 'Current'}
                      </Tag>
                    )}
                    <Button
                      size='sm'
                      variant={viewContent?.id == c.id ? 'solid' : 'ghost'}
                      onClick={() => {
                        onViewContent(c.id)
                      }}
                    >
                      {lang == 'zh' ? '查看' : 'View'}
                    </Button>
                  </HStack>
                </Flex>
              ))}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          setViewContent(null)
          onViewClose()
        }}
      >
        <ModalOverlay />
        <ModalContent minWidth={600}>
          {viewContent && (
            <ModalBody>
              <CodeEditor
                readonly
                value={prettyJson(JSON.parse(viewContent.content))}
                height='600px'
              />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default TemplateCard
