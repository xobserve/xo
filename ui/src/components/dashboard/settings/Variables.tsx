import { Button, Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { remove } from "lodash";
import { EditVariable, VariablesTable } from "pages/cfg/variables";
import { useEffect, useState } from "react";
import { Dashboard } from "types/dashboard";
import { Variable } from "types/variable";

interface Props {
    dashboard: Dashboard
    onChange: any
}


const VariablesSetting = ({ dashboard, onChange }: Props) => {
    const toast = useToast()
    const [variable, setVariable] = useState<Variable>()
    const [editMode, setEditMode] = useState<boolean>(false)

    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const onAddVariable = () => {
        setEditMode(false)
        const id = dashboard.id + new Date().getTime()
        console.log(id)
        setVariable({
            id: id as any,
            name: '',
            type: "1",
        })
        onOpen()
    }

    const addVariable = async (v:Variable) => {
        if (!v.name) {
            toast({
                title: "Variable name is required",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        if (!dashboard.data.variables) {
            dashboard.data.variables = []
        }
        dashboard.data.variables.unshift(v)
        onClose()
        toast({
            title: "Variable added",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setVariable(null)
        onChange()
    }



    const onEditVariable = (variable) => {
        setVariable(variable)
        onOpen()
        setEditMode(true)
    }


    const editVariable = async (v:Variable) => {
        if (!v.name) {
            toast({
                title: "Variable name is required",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        onClose()
        toast({
            title: "Variable updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setVariable(null)
        for (var i=0;i<dashboard.data.variables.length;i++) {
            if (dashboard.data.variables[i].id == v.id) {
                dashboard.data.variables[i] = v
            }
        }
        onChange()
    }

    const onRemoveVariable = async (v:Variable) => {
        onClose()
        toast({
            title: "Variable removed",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setVariable(null)
        for (var i=0;i<dashboard.data.variables.length;i++) {
            if (dashboard.data.variables[i].id == v.id) {
                dashboard.data.variables.splice(i, 1)
            }
        }
        onChange()
    }

    return <>
            <Flex justifyContent="space-between">
                <Text textStyle="subTitle">Variables</Text>
                <Button size="sm" onClick={onAddVariable}>New</Button>
            </Flex>
            <VariablesTable variables={dashboard.data.variables??[]} onEdit={onEditVariable} onRemove={onRemoveVariable}/>
        <EditVariable v={variable} isEdit={editMode} onClose={onClose} isOpen={isOpen} onSubmit={editMode ? editVariable : addVariable}/>
    </>
}

export default VariablesSetting