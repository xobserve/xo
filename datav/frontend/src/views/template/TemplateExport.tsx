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
import { Dashboard, Panel } from 'types/dashboard'
import { TemplateData, TemplateType } from 'types/template'
import { $datasources } from '../datasource/store'
import CodeEditor from 'components/CodeEditor/CodeEditor'
import { prettyJson } from 'utils/string'
import { commonMsg } from 'src/i18n/locales/en'
import { cloneDeep, template } from 'lodash'
import { Datasource } from 'types/datasource'
import { $variables } from '../variables/store'
import { Variable } from 'types/variable'
import { parseVariableFormat } from 'utils/format'
import { MenuItem } from 'types/teams'

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
  const variables = useStore($variables)

  //   console.log('here33333:', data)
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

    let template: TemplateData
    if (type == TemplateType.Panel) {
      const panel: Panel = data
      template = {
        panel,
      }
    } else {
      let dashList: Dashboard[]
      let sidemenu: MenuItem[][]
      if (type == TemplateType.Dashboard) {
        dashList = [data]
      } else {
        // App template
        dashList = data.dashboards
        sidemenu = data.sidemenu
      }

      const dsList: Datasource[] = []
      const gVarList: Variable[] = []
      for (const dash of dashList) {
        for (const p of dash.data.panels) {
          const ds = datasources.find((d) => d.id == p.datasource.id)
          if (ds) {
            const exist = dsList.find((d) => d.id == ds.id)
            if (!exist) {
              dsList.push(cloneDeep(ds))
            }
          }
        }
        const variableData = cloneDeep(dash.data)
        delete variableData.variables

        const formats = parseVariableFormat(JSON.stringify(variableData))
        for (const f of formats) {
          const existInLocal = dash.data.variables.find((v) => v.name == f)
          if (!existInLocal) {
            const existInGlobal = variables.find((v) => v.name == f)
            if (existInGlobal) {
              const exist = gVarList.find((v) => v.name == f)
              if (!exist) {
                const v = cloneDeep(existInGlobal)
                delete v.values
                gVarList.push(v)
              }
            }
          }
        }
      }

      template = {
        dashboards: dashList,
        datasources: dsList,
        variables: gVarList,
      }

      if (sidemenu) {
        template.sidemenu = sidemenu.flat()
      }
    }

    return template
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
              value={prettyJson(templateData)}
              language='json'
              height='500px'
              readonly
            />
            <Button
              variant='outline'
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(templateData))
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
