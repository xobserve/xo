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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import IconButton from 'src/components/button/IconButton'
import { PanelAdd } from 'src/components/icons/PanelAdd'
import { initPanel, initRowPanel } from 'src/data/panel/initPanel'
import { Dashboard, Panel } from 'types/dashboard'
import React from 'react'
import { useStore } from '@nanostores/react'
import { dashboardMsg } from 'src/i18n/locales/en'
import { $copiedPanel } from './store/dashboard'
import { isEmpty } from 'utils/validate'
import { cloneDeep, defaultsDeep, round } from 'lodash'
import { locale } from 'src/i18n/i18n'
import CreateFromTemplate from '../template/CreateFromTemplate'
import {
  TemplateContent,
  TemplateCreateType,
  TemplateData,
  TemplateType,
} from 'types/template'

interface Props {
  dashboard: Dashboard
  onChange: any
}

const AddPanel = ({ dashboard, onChange }: Props) => {
  const t1 = useStore(dashboardMsg)
  const lang = locale.get()
  const copiedPanel = useStore($copiedPanel)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onAddPanel = (isRow) => {
    if (!dashboard.data.panels) {
      dashboard.data.panels = []
    }
    const id = getNextPanelId(dashboard)
    let newPanel: Panel
    if (isRow) {
      newPanel = initRowPanel(id)
    } else {
      newPanel = initPanel(id)
      if (!newPanel.datasource.id) {
        toast({
          title: 'Please create a datasource first..',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }
    }

    // scroll to top after adding panel
    const dashGrid = document.getElementById('dashboard-scroll-top')
    dashGrid.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // dashGrid.scrollTo(0,0)
    onChange((dashboard) => {
      dashboard.data.panels.unshift(newPanel)
    })
  }

  const onPastePanel = () => {
    if (copiedPanel) {
      copyPanel(cloneDeep(copiedPanel))
    }
  }

  const copyPanel = (panel: Panel) => {
    const id = getNextPanelId(dashboard)
    panel.id = id
    panel.gridPos = initPanel().gridPos
    onChange((dashboard) => {
      dashboard.data.panels.unshift(panel)
    })
    // scroll to top after adding panel
    const dashGrid = document.getElementById('dashboard-scroll-top')
    dashGrid.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  const onCreateFromTemplate = (
    templateContent: TemplateContent,
    createType: TemplateCreateType,
  ) => {
    const data: TemplateData = JSON.parse(templateContent.content)
    if (!data.panel) {
      toast({
        title: 'Invalid template, panel section not exist',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    const panel: Panel = {
      ...initPanel(),
      ...data.panel,
    }

    if (createType == TemplateCreateType.Clone) {
      copyPanel(panel)
    } else {
      // create panel with reference points to the template
      panel.templateId = templateContent.templateId
      copyPanel(panel)
    }
  }
  return (
    <>
      <Menu>
        <MenuButton>
          <IconButton variant='ghost'>
            <PanelAdd
              size={28}
              fill={useColorModeValue(
                'var(--chakra-colors-brand-500)',
                'var(--chakra-colors-brand-200)',
              )}
            />
          </IconButton>
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => onAddPanel(false)}>{t1.addPanel}</MenuItem>
          <MenuItem onClick={() => onAddPanel(true)}>
            {lang == 'zh' ? '新建行' : 'Add Row'}
          </MenuItem>
          <MenuItem
            onClick={() => {
              onPastePanel()
            }}
            isDisabled={isEmpty(copiedPanel)}
          >
            {t1.pastePanel}
          </MenuItem>
          <MenuItem onClick={() => onOpen()}>
            {lang == 'zh' ? '基于模版创建' : 'Create from template'}
          </MenuItem>
        </MenuList>
      </Menu>
      <CreateFromTemplate
        type={TemplateType.Panel}
        isOpen={isOpen}
        onClose={onClose}
        onCreated={onCreateFromTemplate}
      />
    </>
  )
}

export default AddPanel

export const getNextPanelId = (dashboard: Dashboard) => {
  const id = round(new Date().getTime() / 1000)
  const exist = dashboard.data.panels.find((p) => p.id == id)
  if (exist) {
    return id + 1
  }

  return id
  // let max = 0

  // for (const panel of dashboard.data.panels) {
  //   if (panel.id > max) {
  //     max = panel.id
  //   }
  // }

  // return max + 1
}
