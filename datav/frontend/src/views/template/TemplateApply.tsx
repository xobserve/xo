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
