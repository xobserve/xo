import { Button, Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { EditVariable, VariablesTable } from "pages/cfg/variables";
import {  useState } from "react";
import { Dashboard } from "types/dashboard";
import { Variable, VariableQueryType } from "types/variable";

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
        setVariable({
            id: id as any,
            name: '',
            type: VariableQueryType.Custom,
            value: "",
            regex: ""
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
        onChange(draft => { draft.data.variables.unshift(v)})
        
        onClose()
        toast({
            title: "Variable added",
            status: "success",
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
        setVariable(null)

        onChange(dashboard => {
            for (var i=0;i<dashboard.data.variables.length;i++) {
                if (dashboard.data.variables[i].id == v.id) {
                    dashboard.data.variables[i] = v
                }
            }
        })  
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
    }

    return <>
            <Flex justifyContent="space-between">
                <Text textStyle="subTitle"></Text>
                <Button size="sm" onClick={onAddVariable}>New</Button>
            </Flex>
            <VariablesTable variables={dashboard.data.variables??[]} onEdit={onEditVariable} onRemove={onRemoveVariable}/>
        {variable && <EditVariable key={variable.id} v={variable} isEdit={editMode} onClose={onClose} isOpen={isOpen} onSubmit={editMode ? editVariable : addVariable}/>}
    </>
}

export default VariablesSetting