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
  Center,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Wrap,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import Empty from 'components/Empty'
import React, { useEffect, useState } from 'react'
import { $config } from 'src/data/configs/config'
import { locale } from 'src/i18n/i18n'
import TemplateCard from 'src/views/template/TemplateCard'
import TemplateEditor from 'src/views/template/TemplateEditor'
import { Template, TemplateType } from 'types/template'
import { requestApi } from 'utils/axios/request'

const TemplateStore = () => {
  const lang = locale.get()
  const config = useStore($config)
  const [type, setType] = useState(TemplateType.App)
  const [templates, setTemplates] = useState<Template[]>([])
  const [tempTemplate, setTempTemplate] = useState<Template>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    if (config) {
      loadTemplates()
    }
  }, [config, type])

  const loadTemplates = async () => {
    const res = await requestApi.get(
      `/template/list/${type}?teamId=${config.currentTeam}`,
    )
    setTemplates(res.data)
  }

  const tabs = [
    {
      value: TemplateType.App,
      label: lang == 'zh' ? '应用模版' : 'Application',
    },
    {
      value: TemplateType.Dashboard,
      label: lang == 'zh' ? '仪表盘模版' : 'Dashboard',
    },
    {
      value: TemplateType.Panel,
      label: lang == 'zh' ? '图表模版' : 'Panel',
    },
  ]

  const onTemplateEdit = (t: Template) => {
    setTempTemplate(t)
    onOpen()
  }

  const onTemplateChange = (t) => {
    setTemplates(templates.map((item) => (item.id == t.id ? t : item)))
    toast({
      title: lang == 'zh' ? '模版已更新' : 'Template updated!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    onClose()
  }
  return (
    <>
      <Box>
        <VStack spacing='2' alignItems='center' p='4'>
          <Center>
            <Image src='/public/rocket.svg' alt='rocket' width={150} />
          </Center>
          <Center>
            <Text fontWeight={550} fontSize={30}>
              {lang == 'zh' ? '模版商店' : 'Template Store'}
            </Text>
          </Center>
          <Center>
            <Text fontWeight={500} fontSize={16} maxW={550}>
              {lang == 'zh'
                ? '选择一个模版快速创建图表、仪表盘甚至完整的应用'
                : 'Choose a template to quickly create a panel, a dashboard or even a whole application.'}
            </Text>
          </Center>
        </VStack>
        <Center>
          <Tabs position='relative' variant='unstyled' size='lg' width='100%'>
            <TabList justifyContent='center'>
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  onClick={() => setType(tab.value)}
                  borderBottom='2px solid'
                  borderColor='transparent'
                  _selected={{
                    // color: 'brand.500',
                    fontWeight: 500,
                    borderColor: 'brand.500',
                  }}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {tabs.map((tab) => (
                <TabPanel key={tab.value}>
                  {templates.length > 0 ? (
                    <Wrap>
                      {templates.map((template) => (
                        <TemplateCard
                          template={template}
                          width={['100%', '100%', '33%']}
                          onEdit={() => onTemplateEdit(template)}
                        />
                      ))}
                    </Wrap>
                  ) : (
                    <Empty />
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Center>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth='700px'>
          <ModalHeader>
            {lang == 'zh' ? '编辑模版' : 'Edit template'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TemplateEditor
              template={tempTemplate}
              onChange={onTemplateChange}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TemplateStore
