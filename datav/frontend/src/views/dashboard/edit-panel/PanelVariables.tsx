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

import { Button, Flex, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { EditVariable, VariablesTable } from 'pages/team/Variables'
import { useState } from 'react'
import { initVariable } from 'src/data/variable'
import {  Dashboard, Panel } from 'types/dashboard'
import { Variable } from 'types/variable'
import React from 'react'
import { useStore } from '@nanostores/react'
import { commonMsg } from 'src/i18n/locales/en'
import { round } from 'lodash'

interface Props {
  panel: Panel
  dashboard: Dashboard
  onChange: any
}

const PanelVariables = ({ panel,dashboard, onChange }: Props) => {
  const t = useStore(commonMsg)
  const toast = useToast()
  const [variable, setVariable] = useState<Variable>()
  const [editMode, setEditMode] = useState<boolean>(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const onAddVariable = () => {
    setEditMode(false)
    const id =  dashboard.id + '-p-' +  round(new Date().getTime() / 1000)
    setVariable({
      id: id as any,
      panelId: panel.id,
      teamId: dashboard.ownedBy,
      ...initVariable,
    })

    onOpen()
  }

  const addVariable = async (v: Variable) => {
    if (
       panel.variables?.find(
        (v1) => v1.name.toLowerCase() == v.name.toLowerCase(),
      )
    ) {
      toast({
        title: t.isExist({ name: v.name }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    onChange((panel:Panel) => {
        if (!panel.variables) {
            panel.variables = [v]
        } else {
            panel.variables.unshift(v)
        }
    })

    onClose()
    toast({
      title: t.isAdded({ name: t.variable }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setVariable(null)
  }

  const onEditVariable = (variable) => {
    setVariable(variable)
    onOpen()
    setEditMode(true)
  }

  const editVariable = async (v: Variable) => {
    if (
      panel.variables.find(
        (v1) => v1.id != v.id && v1.name.toLowerCase() == v.name.toLowerCase(),
      )
    ) {
      toast({
        title: t.isExist({ name: v.name }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    onClose()
    setVariable(null)

    onChange((panel:Panel) => {
      for (var i = 0; i < panel.variables.length; i++) {
        if (panel.variables[i].id == v.id) {
          panel.variables[i] = v
        }
      }
    })
  }

  const onRemoveVariable = async (v: Variable) => {
    onClose()
    setVariable(null)
    onChange((panel:Panel) => {
      for (var i = 0; i < panel.variables.length; i++) {
        if (panel.variables[i].id == v.id) {
          panel.variables.splice(i, 1)
        }
      }
    })
  }

  const onSubmit = async (v: Variable) => {
    if (!v.name) {
      toast({
        title: t.isReqiiured({ name: t.name }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    
    const sameName = panel.variables?.find(
      (v0) => v0.name.trim() == v.name.trim() && v0.id != v.id,
    )


    
    if (sameName) {
      toast({
        title: t.isExist({ name: t.name }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    
    if (editMode) {
      editVariable(v)
      return
    }
    
    addVariable(v)
  }

  return (
    <>
      <Flex justifyContent='space-between' mb='2'>
        <Text textStyle='subTitle'></Text>
        <Button size='sm' onClick={onAddVariable}>
          {t.newItem({ name: t.variable })}
        </Button>
      </Flex>
      <VariablesTable
        variables={panel.variables ?? []}
        onEdit={onEditVariable}
        onRemove={onRemoveVariable}
      />
      {variable && (
        <EditVariable
          key={variable.id}
          v={variable}
          isEdit={editMode}
          onClose={onClose}
          isOpen={isOpen}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}

export default PanelVariables
