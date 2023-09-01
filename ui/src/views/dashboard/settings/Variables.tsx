// Copyright 2023 Datav.io Team
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
import { Button, Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { EditVariable, VariablesTable } from "src/pages/cfg/Variables";
import {  useState } from "react";
import { VariableManuallyChangedKey } from "src/data/storage-keys";
import { initVariable } from "src/data/variable";
import { Dashboard } from "types/dashboard";
import { Variable,  VariableRefresh } from "types/variable";
import storage from "utils/localStorage";
import React from "react";
import { useStore } from "@nanostores/react";
import { commonMsg } from "src/i18n/locales/en";
import { cloneDeep } from "lodash";
import { $variables } from "src/views/variables/store";

interface Props {
    dashboard: Dashboard
    onChange: any
}


const VariablesSetting = ({ dashboard, onChange }: Props) => {
    const variables = useStore($variables)
    const t = useStore(commonMsg)
    const toast = useToast()
    const [variable, setVariable] = useState<Variable>()
    const [editMode, setEditMode] = useState<boolean>(false)

    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const onAddVariable = () => {
        setEditMode(false)
        const id = dashboard.id + new Date().getTime()
        setVariable({
            id: id as any,
            ...initVariable
        })

        onOpen()
    }

    const addVariable = async (v:Variable) => {
        if (variables.find(v1 => v1.name.toLowerCase() == v.name.toLowerCase())) {
            toast({
                title: t.isExist({name: v.name}),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        if (!dashboard.data.variables) {
            dashboard.data.variables = []
        }
        onChange(draft => { draft.data.variables.unshift(v)})
        
        onClose()
        toast({
            title: t.isAdded({name: t.variable}),
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        variables.push(cloneDeep(v))
        setVariable(null)
    }



    const onEditVariable = (variable) => {
        setVariable(variable)
        onOpen()
        setEditMode(true)
    }


    const editVariable = async (v:Variable) => {
        if (variables.find(v1 =>v1.id != v.id &&  v1.name.toLowerCase() == v.name.toLowerCase())) {
            toast({
                title: t.isExist({name: v.name}),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        onClose()
        setVariable(null)

        onChange(dashboard => {
            for (var i=0;i<dashboard.data.variables.length;i++) {
                if (dashboard.data.variables[i].id == v.id) {
                    dashboard.data.variables[i] = v
                }
            }
        })  

        if (v.refresh != VariableRefresh.Manually) {
            storage.remove(VariableManuallyChangedKey + v.id)
        }

        const i = variables.findIndex(v1 => v1.id == v.id)
        if (i >= 0) {
            variables[i] = cloneDeep(v)
        }
    }

    const onRemoveVariable = async (v:Variable) => {
        onClose()
        setVariable(null)
        onChange(dashboard => {
            for (var i=0;i<dashboard.data.variables.length;i++) {
                if (dashboard.data.variables[i].id == v.id) {
                    dashboard.data.variables.splice(i, 1)
                }
            }
        })

        const i = variables.findIndex(v1 => v1.id == v.id)
        variables.splice(i, 1)
    }

    const onSubmit = async (v:Variable) => {
        if (!v.name) {
            toast({
                title: t.isReqiiured({name: t.name}),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        const sameName = dashboard.data.variables.find(v0 =>  (v0.name.trim() == v.name.trim()) && (v0.id != v.id))
        if (sameName) {
            toast({
                title: t.isExist({name: t.name}),
                status: "error",
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

    return <>
            <Flex justifyContent="space-between" mb="2">
                <Text textStyle="subTitle"></Text>
                <Button size="sm" onClick={onAddVariable}>{t.newItem({name: t.variable})}</Button>
            </Flex>
            <VariablesTable variables={dashboard.data.variables??[]} onEdit={onEditVariable} onRemove={onRemoveVariable}/>
        {variable && <EditVariable key={variable.id} v={variable} isEdit={editMode} onClose={onClose} isOpen={isOpen} onSubmit={onSubmit}/>}
    </>
}

export default VariablesSetting