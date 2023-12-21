import {
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Wrap,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import React, { useEffect, useState } from 'react'
import { $config } from 'src/data/configs/config'
import { locale } from 'src/i18n/i18n'
import { Template, TemplateCreateType, TemplateType } from 'types/template'
import { getTemplatesApi } from 'utils/axios/api'
import TemplateCard from './TemplateCard'
import RadionButtons from 'components/RadioButtons'
import { commonMsg } from 'src/i18n/locales/en'
import { requestApi } from 'utils/axios/request'

interface Props {
  type: TemplateType
  isOpen: boolean
  onClose: any
  onCreated: any
}

const CreateFromTemplate = ({ type, isOpen, onClose, onCreated }: Props) => {
  const config = useStore($config)
  const lang = locale.get()
  const t = commonMsg.get()
  const toast = useToast()

  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number>(null)
  const [createType, setCreateType] = useState<TemplateCreateType>(
    TemplateCreateType.Clone,
  )

  useEffect(() => {
    const loadTemplates = async () => {
      const res = await getTemplatesApi(type, config.currentTeam)
      setTemplates(res.data)
    }
    if (config.currentTeam) {
      loadTemplates()
    }
  }, [config.currentTeam])

  const onCreate = async () => {
    if (!selectedTemplate) {
      toast({
        title: lang == 'zh' ? '请选择模版' : 'Please select a template',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    const res = await requestApi.get(
      `/template/content/${
        templates.find((t) => t.id == selectedTemplate).contentId
      }`,
    )

    onCreated(res.data, createType)
    onClose()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth={800}>
          <ModalBody p='4'>
            <Flex alignItems='center' justifyContent='space-between'>
              <Text fontWeight={500} fontSize='1.2rem'>
                {lang == 'zh'
                  ? '基于模版创建图表'
                  : 'Create panel from template'}
              </Text>
              <Button onClick={onCreate}>{t.submit}</Button>
            </Flex>

            <Divider mt='2' />
            <Text mt='2'>
              {lang == 'zh' ? '选择模版' : 'Select a template'}
            </Text>
            <Wrap mt='2'>
              {templates.map((template) => (
                <Box
                  cursor='pointer'
                  width={['100%', '100%', '48%']}
                  onClick={() => {
                    if (!template.contentId) {
                      toast({
                        title:
                          lang == 'zh'
                            ? '该模版还未设定任何内容'
                            : 'There is no content in this template yet',
                        status: 'error',
                        duration: 2000,
                        isClosable: true,
                      })
                      return
                    }
                    setSelectedTemplate(template.id)
                  }}
                >
                  <TemplateCard
                    key={template.id}
                    template={template}
                    width={'100%'}
                    height={300}
                    selected={selectedTemplate == template.id}
                  />
                </Box>
              ))}
            </Wrap>

            <Text my='2'>{lang == 'zh' ? '创建模式' : 'Create mode'}</Text>
            <RadionButtons
              options={[
                { value: TemplateCreateType.Clone, label: '克隆' },
                { value: TemplateCreateType.Refer, label: '引用' },
              ]}
              value={createType}
              onChange={setCreateType}
            />
            {createType == TemplateCreateType.Clone && (
              <Text mt='2' opacity={0.7} fontSize='0.9rem'>
                {lang == 'zh'
                  ? '克隆模式会创建一个新的对象，该对象将跟模版无任何关联，并且可以被任意修改'
                  : 'Clone mode will create a new object, which is not related to the template and can be modified freely'}
              </Text>
            )}
            {createType == TemplateCreateType.Refer && (
              <Text mt='2' opacity={0.7} fontSize='0.9rem'>
                {lang == 'zh'
                  ? '引用模式将创建一个新的对象，该对象直接引用模版的内容。当模版内容发生变化时，该变化将同步到所有引用该模版的对象。基于引用模式创建的对象不可被修改。'
                  : ''}
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CreateFromTemplate
