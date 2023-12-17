import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { locale } from 'src/i18n/i18n'
import { Template } from 'types/template'

interface Props {
  template: Template
}

const initData = {}
const TemplateApply = ({ template }: Props) => {
  const lang = locale.get()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [data, setData] = useState<any>(null)
  const [currentTemplate, setCurrentTemplate] = useState<Template>(null)

  useEffect(() => {
    if (template?.id != currentTemplate?.id) {
      setData(initData)
    }
    if (template) {
      onOpen()
      setCurrentTemplate(template)
    }
  }, [template])
  return (
    <>
      <Drawer placement='right' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody></DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default TemplateApply
