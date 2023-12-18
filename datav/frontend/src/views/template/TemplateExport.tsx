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
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import React, { useEffect, useMemo } from 'react'
import { Panel } from 'types/dashboard'
import { TemplateData, TemplateType } from 'types/template'
import { $datasources } from '../datasource/store'
import CodeEditor from 'components/CodeEditor/CodeEditor'
import { prettyJson } from 'utils/string'
import { commonMsg } from 'src/i18n/locales/en'

interface Props {
  type: TemplateType
  data: any
  onClose: any
}
const TemplateExport = (props: Props) => {
  const t = commonMsg.get()
  const toast = useToast()
  const { type, data } = props
  const { isOpen, onOpen, onClose } = useDisclosure()
  const datasources = useStore($datasources)
  useEffect(() => {
    if (data) {
      onOpen()
    } else {
      onClose()
    }
  }, [data])

  const templateData = useMemo(() => {
    if (!data) {
      return null
    }
    if (type == TemplateType.Panel) {
      const panel: Panel = data
      const ds = datasources.find((ds) => ds.id == panel.datasource.id)
      const templateDs = []
      if (ds) {
        templateDs.push(ds)
      }

      const template: TemplateData = {
        panel,
        datasources: templateDs,
      }

      return prettyJson(template)
    }
  }, [type, data])

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          props.onClose()
        }}
      >
        <ModalOverlay />
        {templateData && (
          <ModalContent minWidth={600}>
            <ModalBody>Export as template</ModalBody>
            <CodeEditor
              value={templateData}
              language='json'
              height='500px'
              readonly
            />
            <Button
              variant='outline'
              onClick={() => {
                navigator.clipboard.writeText(templateData)
                toast({
                  title: t.copied,
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                })
              }}
            >
              {t.copy} JSON
            </Button>
          </ModalContent>
        )}
      </Modal>
    </>
  )
}
export default TemplateExport
