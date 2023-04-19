import { Button, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, VStack, InputGroup, InputLeftAddon, Input, Flex, Box, useToast, Alert, AlertIcon, AlertTitle, AlertDescription, Divider, Text, RadioGroup, Stack, Radio } from "@chakra-ui/react"
import useSession from "hooks/use-session"
import Page from "layouts/page/Page"
import { cloneDeep } from "lodash"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FaCog } from "react-icons/fa"
import { cfgLinks } from "src/data/nav-links"
import ReserveUrls from "src/data/reserve-urls"
import { Team } from "types/teams"
import { Variable } from "types/variable"
import { requestApi } from "utils/axios/request"

const variableTypes = {
    "1": "Custom values",
    "2": "Get by http request",
    "3": "Backend hardcoded",
}

const GlobalVariablesPage = () => {
    const toast = useToast()
    const [variables, setVariables] = useState<Variable[]>([])
    const [variable, setVariable] = useState<Variable>()
    const [editMode, setEditMode] = useState<boolean>(false)

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/variable/all")
        setVariables(res.data)
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    const onAddVariable = () => {
        setEditMode(false)
        setVariable({
            id: 0,
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

        await requestApi.post("/variable/new", v)
        onClose()
        toast({
            title: "Variable added",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setVariable(null)
        load()
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

        await requestApi.post("/variable/update", v)
        onClose()
        toast({
            title: "Variable updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setVariable(null)
        load()
    }

    const onRemoveVariable = async (v:Variable) => {
        await requestApi.delete(`/variable/${v.id}`,)
        onClose()
        toast({
            title: "Variable removed",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setVariable(null)
        load()
    }

    return <>
        <Page title={`Configuration`} subTitle="Manage global variables" icon={<FaCog />} tabs={cfgLinks}>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onAddVariable}>Add global variable</Button>
            </Flex>
            <VariablesTable variables={variables} onEdit={onEditVariable} onRemove={onRemoveVariable}/>
        </Page>
        <EditVariable v={variable} isEdit={editMode} onClose={onClose} isOpen={isOpen} onSubmit={editMode ? editVariable : addVariable} isGlobal/>
    </>
}


export default GlobalVariablesPage

interface TableProps {
    variables: Variable[]
    onEdit: any
    onRemove:any
}

export const VariablesTable = ({variables,onEdit,onRemove}:TableProps) => {
    const getVariableValue = (variable: Variable) => {
        if (variable.type === "1") {
            return variable.value
        }

        if (variable.type == "2") {
            return variable.externalUrl
        }

        return "refer to backend code"
    }
    
    return (<>
        {variables.length > 0 ? <TableContainer>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Variable name</Th>
                        <Th>Query type</Th>
                        <Th>Values</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {variables.map(variable => {
                        return <Tr key={variable.name}>
                            <Td>{variable.name}</Td>
                            <Td>{variableTypes[variable.type]}</Td>
                            <Td>{getVariableValue(variable)}</Td>
                            <Td>
                                <Button variant="ghost" size="sm" px="0" onClick={() => onEdit(variable)}>Edit</Button>
                                <Button variant="ghost" colorScheme="orange" size="sm" px="0" ml="1" onClick={() => onRemove(variable)}>Remove</Button>
                            </Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </TableContainer> :
            <>
                <Alert
                    status='info'
                    variant='subtle'
                    flexDirection='column'
                    alignItems='left'
                    justifyContent='center'
                    width="fit-content"
                // maxWidth="500px"
                // textAlign='center'
                // height='200px'
                >
                    <AlertIcon boxSize='40px' mr={0} />
                    <AlertTitle mt={4} mb={4} fontSize='lg'>
                        There is no variables yet.
                    </AlertTitle>
                    <Divider />
                    <AlertDescription mt="4">
                        <Box textStyle="subTitle">What is variable?</Box>
                        <Text mt="2">Variables enable more interactive and dynamic dashboards. Instead of hard-coding things like server or sensor names in your metric queries you can use variables in their place. Variables are shown as dropdown select boxes at the top of the dashboard. These dropdowns make it easy to change the data being displayed in your dashboard. </Text>
                    </AlertDescription>

                    <AlertDescription mt="4">
                        <Box textStyle="subTitle">Global variable?</Box>
                        <Text mt="2">Variables created here are called global varaibles, they can be used everywhere, most importantly, once you have selected a global variable in one place, all the other places using this variable can also be affected.</Text>
                        <Text mt="2">e.g Let's assuming that you have created three dashboards: A, B, C, and a global variable 'application' which has two values: 'aiapm' and 'api-gateway', once you selected `application` in 'A' and set its value to 'ai-apm', the other two 'B' and 'C' will also be affected by this change. When you enter 'B' page, you will see the 'application' variable's value has already changed to 'aiapm'. </Text>
                        <Text mt="2">This is really userful in apm scenarios, so don't be afraid to try it.</Text>
                    </AlertDescription>
                </Alert>
            </>
        }
    </>)
}

interface EditProps {
    v: Variable
    isOpen:any 
    onClose: any
    isEdit: boolean
    onSubmit: any
    isGlobal?: boolean
}

export const EditVariable = ({v,isOpen,onClose,isEdit,onSubmit,isGlobal=false}:EditProps) => {
    const [variable,setVariable] = useState<Variable>()
    useEffect(() => {
        setVariable(v)
    },[v])
    return (<>
    <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minW="600px">
                <ModalHeader>{isEdit ? "Edit global variable" : "Add new global variable"} </ModalHeader>
                <ModalCloseButton />
                {variable && <ModalBody >
                    <VStack alignItems="left" spacing="3">
                        <Box>
                            <Box textStyle="subTitle">Name</Box>
                            <Input mt="2" width="400px" placeholder='Only alphabet and digit numbers are allowed' value={variable.name} onChange={e => { setVariable({ ...variable, name: e.currentTarget.value }) }} />
                        </Box>

                        <Box>
                            <Box textStyle="subTitle">Description</Box>
                            <Input mt="2" width="400px" placeholder='give this variable a simple description' value={variable.brief} onChange={e => { setVariable({ ...variable, brief: e.currentTarget.value }) }} />
                        </Box>

                        <Box>
                            <Box textStyle="subTitle">Query Type</Box>
                            <RadioGroup mt="2" onChange={v => setVariable({ ...variable, type: v })} value={variable.type}>
                                <Stack direction='row'>
                                    <Radio value='1'>{variableTypes['1']}</Radio>
                                    <Radio value='2'>{variableTypes['2']}</Radio>
                                    {isGlobal && <Radio value='3'>{variableTypes['3']}</Radio>}
                                </Stack>
                            </RadioGroup>
                        </Box>


                        {variable.type == "1" && <Input width="400px" placeholder='Values separated by comma,e.g 1,10,20,a,b,c' value={variable.value} onChange={e => { setVariable({ ...variable, value: e.currentTarget.value }) }} />}
                        {variable.type == "2" && <Input width="400px" placeholder='enter a valid http url, please refer our documents for more info' value={variable.externalUrl} onChange={e => { setVariable({ ...variable, externalUrl: e.currentTarget.value }) }} />}

                    </VStack>
                </ModalBody>}
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button variant='ghost' onClick={()=>onSubmit(variable)}>Submit</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>)
}