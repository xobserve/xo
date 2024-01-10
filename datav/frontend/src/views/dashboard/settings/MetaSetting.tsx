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
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import CodeEditor from 'src/components/CodeEditor/CodeEditor'
import { DetailAlert, DetailAlertItem } from 'src/components/DetailAlert'
import React from 'react'
import { useRef, useState } from 'react'
import {
  commonMsg,
  dashboardSettingMsg,
  templateMsg,
} from 'src/i18n/locales/en'
import { Dashboard } from 'types/dashboard'
import { requestApi } from 'utils/axios/request'
import TemplateExport from 'src/views/template/TemplateExport'
import { TemplateType } from 'types/template'
import { clone } from 'lodash'
import {
  extractDashboardTemplateContent,
  extractPanelTemplateContent,
} from 'utils/template'

interface Props {
  dashboard: Dashboard
  onChange: any
}

const MetaSettings = ({ dashboard }: Props) => {
  const t = commonMsg.get()
  const t1 = dashboardSettingMsg.get()
  const t2 = templateMsg.get()

  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()

  const dash = JSON.stringify(dashboard, null, 4)
  const rawMeta = useRef(dash)
  const [meta, setMeta] = useState(dash)
  const [templateDash, setTemplateDash] = useState<Partial<Dashboard>>(null)

  const onSubmit = async () => {
    await requestApi.post('/dashboard/save', {
      dashboard: JSON.parse(meta),
      changes: 'modify dashboard meta data',
    })
    toast({
      title: 'Dashboard saved.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    window.location.reload()
  }

  return (
    <>
      <Box width='100%' height='500px' className='bordered' mb='3'>
        <CodeEditor value={meta} onChange={(v) => setMeta(v)} language='json' />
      </Box>

      <DetailAlert status='warning' title={t1.saveWarnTitle}>
        <DetailAlertItem>
          <Text>{t1.saveWarnContent}</Text>
        </DetailAlertItem>
        <AlertDescription maxWidth='sm'></AlertDescription>
      </DetailAlert>

      <HStack mt='2'>
        <Button isDisabled={meta == rawMeta.current} onClick={onOpen}>
          {t.save}
        </Button>
        <Button
          onClick={() => {
            setTemplateDash(extractDashboardTemplateContent(clone(dashboard)))
          }}
          variant='outline'
        >
          {t2.exportTemplate}
        </Button>
      </HStack>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {t1.saveAlertTitle}
            </AlertDialogHeader>

            <AlertDialogBody>{t1.saveAlertContent}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t.cancel}
              </Button>
              <Button colorScheme='red' onClick={onSubmit} ml={3}>
                {t.submit}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <TemplateExport
        type={TemplateType.Dashboard}
        data={templateDash}
        onClose={() => setTemplateDash(null)}
      />
    </>
  )
}

export default MetaSettings