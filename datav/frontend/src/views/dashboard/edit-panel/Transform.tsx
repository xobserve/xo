// Copyright 2023 xObserve.io Team

import { Box, Checkbox, HStack, Text } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import { Divider } from 'antd'
import { CodeEditorModal } from 'src/components/CodeEditor/CodeEditorModal'
import { DetailAlert, DetailAlertItem } from 'src/components/DetailAlert'
import React from 'react'
import { commonMsg, panelMsg } from 'src/i18n/locales/en'
import { Panel } from 'types/dashboard'

interface Props {
  panel: Panel
  onChange: any
}

const EditPanelTransform = ({ panel, onChange }: Props) => {
  const t = useStore(commonMsg)
  const t1 = useStore(panelMsg)

  return (
    <Box>
      <Box my='2'>
        <DetailAlert title={t.transform} status='info' width='100%'>
          <DetailAlertItem>
            <Text mt='2'>{t1.transformTips}</Text>
          </DetailAlertItem>
        </DetailAlert>
      </Box>
      <CodeEditorModal
        value={panel.transform}
        onChange={(v) => {
          onChange((panel: Panel) => {
            panel.transform = v
          })
        }}
      />
    </Box>
  )
}

export default EditPanelTransform
