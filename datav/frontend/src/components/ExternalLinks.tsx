import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  StackDivider,
  Switch,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { ExternalLink } from 'types/dashboard'
import { FormSection } from './form/Form'
import FormItem from './form/Item'
import { isEmpty } from 'utils/validate'
import { commonMsg } from 'src/i18n/locales/en'
import { FaRegEdit, FaTimes } from 'react-icons/fa'
import { locale } from 'src/i18n/i18n'

interface Props {
  links: ExternalLink[]
  onChange: any
}

export const ExternalLinksEditor = (props: Props) => {
  const t = commonMsg.get()
  const lang = locale.get()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [links, setLinks] = useState<ExternalLink[]>(props.links ?? [])
  const [tempLink, setTempLink] = useState<ExternalLink>(null)
  const [editIndex, setEditIndex] = useState<number>(null)

  const toast = useToast()
  const onAddLink = () => {
    if (isEmpty(tempLink.title) || isEmpty(tempLink.url)) {
      toast({
        title: 'Title and URL are required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    let newLinks
    if (editIndex !== null) {
      newLinks = links.map((link, i) => {
        if (i === editIndex) {
          return tempLink
        }
        return link
      })
    } else {
      newLinks = [...links, tempLink]
    }

    setLinks(newLinks)
    setTempLink(null)
    props.onChange(newLinks)
    onClose()
  }

  const onRemoveLink = (index) => {
    const newLinks = links.filter((_, i) => i !== index)
    setLinks(newLinks)
    props.onChange(newLinks)
  }
  return (
    <>
      <VStack alignItems='left' divider={<StackDivider />}>
        {links.map((link, index) => (
          <Flex justifyContent='space-between'>
            <Box>
              <Text>{link.title}</Text>
              <Text>{link.url}</Text>
            </Box>
            <HStack className='action-icon'>
              <FaRegEdit
                cursor='pointer'
                onClick={() => {
                  setEditIndex(index)
                  setTempLink(link)
                  onOpen()
                }}
              />
              <FaTimes cursor='pointer' onClick={() => onRemoveLink(index)} />
            </HStack>
          </Flex>
        ))}
      </VStack>
      <Button
        mt='4'
        size='sm'
        width='fit-content'
        onClick={() => {
          setEditIndex(null)
          setTempLink({
            title: '',
            url: '',
            targetBlank: false,
          })
          onOpen()
        }}
      >
        {lang == 'zh' ? '新建链接' : 'Add Link'}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t.editItem({ name: t.link })}</ModalHeader>
          <ModalBody>
            {tempLink && (
              <FormSection spacing={1}>
                <FormItem
                  title={t.title}
                  alignItems='center'
                  labelWidth={'100px'}
                >
                  <Input
                    value={tempLink.title}
                    onChange={(e) =>
                      setTempLink({
                        ...tempLink,
                        title: e.currentTarget.value,
                      })
                    }
                  />
                </FormItem>
                <FormItem title='URL' alignItems='center' labelWidth={'100px'}>
                  <Input
                    value={tempLink.url}
                    onChange={(e) =>
                      setTempLink({
                        ...tempLink,
                        url: e.currentTarget.value,
                      })
                    }
                  />
                </FormItem>
                <FormItem
                  title={lang == 'zh' ? '在新窗口打开' : 'Open in new tab'}
                  alignItems='center'
                  labelWidth={'100px'}
                >
                  <Switch
                    isChecked={tempLink.targetBlank}
                    onChange={(e) =>
                      setTempLink({
                        ...tempLink,
                        targetBlank: e.target.checked,
                      })
                    }
                  />
                </FormItem>
              </FormSection>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              {t.cancel}
            </Button>
            <Button onClick={onAddLink}>{t.submit}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
