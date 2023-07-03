import { Button, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure,  Input, Flex, Box, useToast, Text, Switch, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from "@chakra-ui/react"
import { DetailAlert, DetailAlertItem } from "components/DetailAlert"
import RadionButtons from "components/RadioButtons"
import DatasourceSelect from "components/datasource/Select"
import { EditorInputItem } from "components/editor/EditorItem"
import { Form, FormSection } from "components/form/Form"
import Page from "layouts/page/Page"
import { isArray, isEmpty } from "lodash"
import { datasources } from "src/views/App"
import { useEffect, useRef, useState } from "react"
import { FaCog } from "react-icons/fa"
import { cfgLinks } from "src/data/nav-links"
import { initVariable } from "src/data/variable"

import HttpVariableEditor from "src/views/dashboard/plugins/datasource/http/VariableEditor"
import PrometheusVariableEditor from "src/views/dashboard/plugins/datasource/prometheus/VariableEditor"
import { DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { Variable, VariableQueryType, VariableRefresh } from "types/variable"
import { useImmer } from "use-immer"
import { requestApi } from "utils/axios/request"
import { queryVariableValues } from "src/views/variables/Variables"
import storage from "utils/localStorage"
import { VariableManuallyChangedKey } from "src/data/storage-keys"
import { dispatch } from "use-bus"
import { VariableForceReload } from "src/data/bus-events"
import FormItem from "components/form/Item"




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
            ...initVariable
        })
        onOpen()
    }

    const addVariable = async (v: Variable) => {
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


    const editVariable = async (v: Variable) => {
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

    const onRemoveVariable = async (v: Variable) => {
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
            <VariablesTable variables={variables} onEdit={onEditVariable} onRemove={onRemoveVariable} />
        </Page>
        {variable && <EditVariable key={variable.id} v={variable} isEdit={editMode} onClose={onClose} isOpen={isOpen} onSubmit={editMode ? editVariable : addVariable} isGlobal />}
    </>
}


export default GlobalVariablesPage

interface TableProps {
    variables: Variable[]
    onEdit: any
    onRemove: any
}

export const VariablesTable = ({ variables, onEdit, onRemove }: TableProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedVariable, setSelectedVariable] = useState<Variable>(null)

    const toast = useToast()
    const reloadValues = (id, name) => {
        storage.remove(VariableManuallyChangedKey + id)
        dispatch(VariableForceReload + id)
        toast({
            description: `Values of ${name} has been updated!`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    }
    const cancelRef = useRef()

    const onRemoveClose = () => {
        setSelectedVariable(null)
        onClose()
    }
    return (<>
        {variables.length > 0 ? <TableContainer>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Variable name</Th>
                        <Th>Query type</Th>
                        <Th>Datasource</Th>
                        <Th>Refresh</Th>
                        <Th>Regex filter</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {variables.map(variable => {
                        return <Tr key={variable.name} className={`${variable.id == selectedVariable?.id ? "highlight-bg" : ''}`}>
                            <Td>{variable.name}</Td>
                            <Td>{variable.type}</Td>
                            <Td>{datasources?.find(ds => ds.id == variable.datasource)?.name}</Td>
                            <Td>{variable.refresh} {variable.refresh == VariableRefresh.Manually && <Button size="sm" variant="ghost" ml="1" onClick={() => reloadValues(variable.id, variable.name)}>reload values</Button>}</Td>
                            <Td>{variable.regex}</Td>
                            <Td>
                                <Button variant="ghost" size="sm" px="0" onClick={() => onEdit(variable)}>Edit</Button>
                                <Button variant="ghost" colorScheme="orange" size="sm" px="0" ml="1" onClick={() => { setSelectedVariable(variable); onOpen() }}>Remove</Button>
                            </Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </TableContainer> :
            <>
                <DetailAlert title="There is no variables yet." status="info">
                    <DetailAlertItem title="What is variable?">
                        <Text mt="2">Variables enable more interactive and dynamic dashboards. Instead of hard-coding things like server or sensor names in your metric queries you can use variables in their place. Variables are shown as dropdown select boxes at the top of the dashboard. These dropdowns make it easy to change the data being displayed in your dashboard. </Text>
                    </DetailAlertItem>

                    <DetailAlertItem title="Global variable?">
                        <Text mt="2">Variables created here are called global varaibles, they can be used everywhere, most importantly, once you have selected a global variable in one place, all the other places using this variable can also be affected.</Text>
                        <Text mt="2">e.g Let's assuming that you have created three dashboards: A, B, C, and a global variable 'application' which has two values: 'aiapm' and 'api-gateway', once you selected `application` in 'A' and set its value to 'ai-apm', the other two 'B' and 'C' will also be affected by this change. When you enter 'B' page, you will see the 'application' variable's value has already changed to 'aiapm'. </Text>
                        <Text mt="2">This is really userful in apm scenarios, so don't be afraid to try it.</Text>
                    </DetailAlertItem>
                </DetailAlert>
            </>
        }

        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onRemoveClose}
        >
            <AlertDialogOverlay>
                {selectedVariable && <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete variable - {selectedVariable.name}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onRemoveClose}>
                            Cancel
                        </Button>
                        <Button colorScheme='red' onClick={() => { onRemove(selectedVariable); onRemoveClose() }} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>}
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

interface EditProps {
    v: Variable
    isOpen: any
    onClose: any
    isEdit: boolean
    onSubmit: any
    isGlobal?: boolean
}


export const EditVariable = ({ v, isOpen, onClose, isEdit, onSubmit, isGlobal = false }: EditProps) => {
    const [variable, setVariable] = useImmer<Variable>(null)
    const [datasources, setDatasources] = useState<Datasource[]>(null)
    const [variableValues, setVariableValues] = useState<string[]>([])
    const [displayCount, setDisplayCount] = useState(30)
    useEffect(() => {
        setVariable(v)
    }, [v])

    useEffect(() => {
        load()
        queryVariableValues(v).then(result => setVariableValues(result))

    }, [])

    const load = async () => {
        const res = await requestApi.get("/datasource/all")
        setDatasources(res.data)
    }

    const onQueryResult = result => {
        const regex = new RegExp(variable.regex)
        let res = result
        if (variable.regex) {
            res = result?.filter(r => regex.test(r))
        }

        if (!isArray(res)) {
            res = []
        }
        setVariableValues(res)
    }

    const currentDatasource = datasources?.find(ds => ds.id == variable?.datasource)

    return (<>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent minW="600px">
                <ModalHeader>{isEdit ? "Edit variable" : "Add new variable"} </ModalHeader>
                <ModalCloseButton />
                {variable && <ModalBody>
                    <Form maxWidth="600px" sx={{
                    '.form-item-label': {
                        width: "150px"
                    }
                }}>
                        <FormSection title="Basic">
                            <FormItem title="Name">
                                <Input placeholder='Only alphabet and digit numbers are allowed' value={variable.name} onChange={e => { setVariable({ ...variable, name: e.currentTarget.value }) }} />
                            </FormItem>
                            <FormItem title="Description">
                                <Input placeholder='give this variable a simple description' value={variable.description} onChange={e => { setVariable({ ...variable, description: e.currentTarget.value }) }} />
                            </FormItem>
                            <FormItem title="Refresh">
                                <RadionButtons size="sm" options={Object.keys(VariableRefresh).map(k =>
                                    ({ label: VariableRefresh[k], value: VariableRefresh[k] })
                                )} value={variable.refresh} onChange={(v) => setVariable({ ...variable, refresh: v })} />
                            </FormItem>

                            <FormItem title="Multi value">
                                <Switch defaultChecked={variable.enableMulti} onChange={(e) => setVariable({ ...variable, enableMulti: e.currentTarget.checked })} />
                            </FormItem>

                            <FormItem title="Include all">
                                <Switch defaultChecked={variable.enableAll} onChange={(e) => setVariable({ ...variable, enableAll: e.currentTarget.checked })} />
                            </FormItem>

                        </FormSection>

                        <FormSection title="Query">
                            <FormItem title="Query type">
                            <RadionButtons size="sm" options={Object.keys(VariableQueryType).map(k =>
                                    ({ label: k, value: VariableQueryType[k] })
                                )} value={variable.type} onChange={v => setVariable({ ...variable, type: v, value: '' })} />
                            </FormItem>
                            
                            {variable.type == VariableQueryType.Custom && <FormItem title="Query values">
                                <Input width="400px" placeholder='Values separated by comma,e.g 1,10,20,a,b,c' value={variable.value} onChange={e => { setVariable({ ...variable, value: e.currentTarget.value }) }} onBlur={() => onQueryResult(variable.value.split(','))} />
                            </FormItem>}

                            {variable.type == VariableQueryType.Datasource && <>
                                <FormItem title="Select datasource">
                                    <Box width="200px">
                                        <DatasourceSelect value={variable.datasource} onChange={id => setVariable(v => { v.datasource = id; v.value = "" })} allowTypes={[DatasourceType.Prometheus, DatasourceType.ExternalHttp]} variant="outline" /></Box>
                                </FormItem>
                                {
                                    currentDatasource?.type == DatasourceType.Prometheus && <PrometheusVariableEditor variable={variable} onChange={setVariable} onQueryResult={onQueryResult} />
                                }
                                {
                                    currentDatasource?.type == DatasourceType.ExternalHttp && <HttpVariableEditor variable={variable} onChange={setVariable} onQueryResult={onQueryResult} />
                                }
                            </>
                            }
                        </FormSection>

                        <FormSection title="Regex filter ( optional )" >
                            <EditorInputItem value={variable.regex} placeholder="further filter the query result through a Regex pattern" onChange={v => {
                                setVariable({ ...variable, regex: v })
                            }} />
                        </FormSection>



                        <FormSection title="Variable values" >
                            <Box pt="1">
                                {!isEmpty(variableValues) && variableValues.slice(0, displayCount).map(v => <Tag size="sm" variant="outline" ml="1">{v}</Tag>)}
                            </Box>
                            {variableValues?.length > displayCount && <Button mt="2" size="sm" colorScheme="gray" ml="1" onClick={() => setDisplayCount(displayCount + 30)}>Show more</Button>}
                        </FormSection>
                    </Form>
                </ModalBody>}
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button variant='ghost' onClick={() => onSubmit(variable)}>Submit</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>)
}