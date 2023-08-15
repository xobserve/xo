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

import React from "react"
import { Button, Table, TableContainer, Tag, Tbody, Td, Th, Thead, Tr, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, Input, Flex, Box, useToast, Text, Switch, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from "@chakra-ui/react"
import { DetailAlert, DetailAlertItem } from "components/DetailAlert"
import RadionButtons from "components/RadioButtons"
import DatasourceSelect from "components/datasource/Select"
import { EditorInputItem } from "components/editor/EditorItem"
import { Form, FormSection } from "components/form/Form"
import Page from "layouts/page/Page"
import { isArray, isEmpty } from "lodash"
import { datasources } from "src/App"
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
import { queryVariableValues } from "src/views/variables/SelectVariable"
import storage from "utils/localStorage"
import { VariableManuallyChangedKey } from "src/data/storage-keys"
import { dispatch } from "use-bus"
import { VariableForceReload } from "src/data/bus-events"
import FormItem from "components/form/Item"
import JaegerVariableEditor from "src/views/dashboard/plugins/datasource/jaeger/VariableEditor"
import { useStore } from "@nanostores/react"
import { cfgVariablemsg, commonMsg } from "src/i18n/locales/en"
import LokiVariableEditor from "src/views/dashboard/plugins/datasource/loki/VariableEdtiro"
import { hasVariableFormat, replaceWithVariables } from "utils/variable"
import { getDatasource } from "utils/datasource"




const GlobalVariablesPage = () => {
    const t = useStore(commonMsg)
    const t1 = useStore(cfgVariablemsg)

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
                title: t.isReqiiured({name: t.itemName({name: t.variable}) }),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        await requestApi.post("/variable/new", v)
        onClose()
        toast({
            title: t.isAdded({name: t.variable}),
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
                title: t.isReqiiured({name: t.itemName({name: t.variable}) }),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        await requestApi.post("/variable/update", v)
        onClose()
        toast({
            title: t.isUpdated({name: t.variable}),
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
            title:  t.isDeleted({name: t.variable}),
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setVariable(null)
        load()
    }

    return <>
        <Page title={t.configuration} subTitle={t1.subTitle} icon={<FaCog />} tabs={cfgLinks}>
            <Flex justifyContent="space-between">
                <Box></Box>
                <Button size="sm" onClick={onAddVariable}>{t.newItem({name: t.variable})}</Button>
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
    const t = useStore(commonMsg)
    const t1 = useStore(cfgVariablemsg)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedVariable, setSelectedVariable] = useState<Variable>(null)

    const toast = useToast()
    const reloadValues = (id, name) => {
        storage.remove(VariableManuallyChangedKey + id)
        dispatch(VariableForceReload + id)
        toast({
            description: t1.valueUpdated({name}),
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
                        <Th>{t.itemName({name: t.variable})}</Th>
                        <Th>{t1.queryType}</Th>
                        <Th>{t.datasource}</Th>
                        <Th>{t1.refresh}</Th>
                        <Th>{t1.regexFilter}</Th>
                        <Th>{t.action}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {variables.map(variable => {
                        return <Tr key={variable.name} className={`${variable.id == selectedVariable?.id ? "highlight-bg" : ''}`}>
                            <Td>{variable.name}</Td>
                            <Td>{t[variable.type]}</Td>
                            <Td>{datasources?.find(ds => ds.id == variable.datasource)?.name}</Td>
                            <Td>{t1[variable.refresh]} {variable.refresh == VariableRefresh.Manually && <Button size="sm" variant="ghost" ml="1" onClick={() => reloadValues(variable.id, variable.name)}>{t1.reload}</Button>}</Td>
                            <Td>{variable.regex}</Td>
                            <Td>
                                <Button variant="ghost" size="sm" px="0" onClick={() => onEdit(variable)}>{t.edit}</Button>
                                <Button variant="ghost" colorScheme="orange" size="sm" px="0" ml="1" onClick={() => { setSelectedVariable(variable); onOpen() }}>{t.delete}</Button>
                            </Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </TableContainer> :
            <>
                <DetailAlert title={t1.noVariableTitle} status="info">
                    <DetailAlertItem title={t1.whatIsVariable}>
                        <Text mt="2">{t1.whatIsVariableTips} </Text>
                    </DetailAlertItem>

                    <DetailAlertItem title={t1.globalVariable}>
                        <Text mt="2">{t1.globalVariableTips1}</Text>
                        <Text mt="2">{t1.globalVariableTips2}</Text>
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
                        {t.deleteItem({name: t.variable})} - {selectedVariable.name}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {t.deleteAlert}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onRemoveClose}>
                            {t.cancel}
                        </Button>
                        <Button colorScheme='red' onClick={() => { onRemove(selectedVariable); onRemoveClose() }} ml={3}>
                            {t.delete}
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
    const t = useStore(commonMsg)
    const t1 = useStore(cfgVariablemsg)
    const toast = useToast()
    const [variable, setVariable] = useImmer<Variable>(null)
    const [datasources, setDatasources] = useState<Datasource[]>(null)
    const [variableValues, setVariableValues] = useState<string[]>([])
    const [displayCount, setDisplayCount] = useState(30)
    useEffect(() => {
        setVariable(v)
    }, [v])

    useEffect(() => {
        load()
        queryVariableValues(v).then(result => setVariableValues(result.data ?? []))

    }, [])

    const load = async () => {
        const res = await requestApi.get("/datasource/all")
        setDatasources(res.data)
    }

    const onQueryResult = result => {
        if (!result.error) {
            try {
                const regex = new RegExp(variable.regex)
                let res = result.data
                if (variable.regex) {
                    res = result?.data?.filter(r => regex.test(r))
                }

                if (!res) {
                    res = []
                }
                setVariableValues(res)
                // if (result.data) {
                //     toast({
                //         title: "Variable values updated!",
                //         status: "success",
                //         duration: 2000,
                //         isClosable: true,
                //     });
                // }
            
                return
            } catch (error) {
                result.error = error.message
            }

        }
        toast({
            title: "Error",
            description: result.error,
            status: "error",
            duration: 3000,
            isClosable: true,
        });

        setVariableValues([])
}

let currentDatasource;
if (variable?.datasource) {
    const ds = variable.datasource.toString()
    currentDatasource = getDatasource(ds)
}

return (<>
    <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent minW="600px">
            <ModalHeader>{isEdit ? t.editItem({name: t.variable}): t.newItem({name: t.variable})} </ModalHeader>
            <ModalCloseButton />
            {variable && <ModalBody>
                <Form maxWidth="600px" sx={{
                    '.form-item-label': {
                        width: "150px"
                    }
                }}>
                    <FormSection title={t.basicSetting}>
                        <FormItem title={t.name}>
                            <Input placeholder={t1.nameTips} value={variable.name} onChange={e => { setVariable({ ...variable, name: e.currentTarget.value }) }} />
                        </FormItem>
                        <FormItem title={t.description}>
                            <Input placeholder={t1.descTips} value={variable.description} onChange={e => { setVariable({ ...variable, description: e.currentTarget.value }) }} />
                        </FormItem>
                        <FormItem title={t1.refresh}>
                            <RadionButtons options={Object.keys(VariableRefresh).map(k =>
                                ({ label: t1[k], value: t1[k]})
                            )} value={variable.refresh} onChange={(v) => setVariable({ ...variable, refresh: v })} />
                        </FormItem>

                        <FormItem title={t1.multiValue} alignItems="center">
                            <Switch defaultChecked={variable.enableMulti} onChange={(e) => setVariable({ ...variable, enableMulti: e.currentTarget.checked })} />
                        </FormItem>

                        <FormItem title="Include all" alignItems="center">
                                <Switch defaultChecked={variable.enableAll} onChange={(e) => setVariable({ ...variable, enableAll: e.currentTarget.checked })} />
                            </FormItem>

                    </FormSection>

                    <FormSection title={t.query}>
                        <FormItem title={t1.queryType}>
                            <RadionButtons options={Object.keys(VariableQueryType).map(k =>
                                ({ label: t[VariableQueryType[k]] , value: VariableQueryType[k] })
                            )} value={variable.type} onChange={v => setVariable({ ...variable, type: v, value: '' })} />
                        </FormItem>

                        {variable.type == VariableQueryType.Custom && <FormItem title={t1.queryValue}>
                            <Input width="400px" placeholder={t1.valueTips} value={variable.value} onChange={e => { setVariable({ ...variable, value: e.currentTarget.value?.trim() }) }} onBlur={() => onQueryResult({error:null,data: variable.value.split(',')})} />
                        </FormItem>}

                        {variable.type == VariableQueryType.Query && <>
                            <FormItem title={t1.selectDs}>
                                <Box width="200px">
                                    <DatasourceSelect value={variable.datasource} onChange={id => setVariable(v => { v.datasource = id; v.value = "" })} allowTypes={[DatasourceType.Prometheus, DatasourceType.ExternalHttp, DatasourceType.Jaeger, DatasourceType.Loki]} variant="outline" /></Box>
                            </FormItem>
                            {/* @needs-update-when-add-new-variable-datasource */}
                            {
                                currentDatasource?.type == DatasourceType.Prometheus && <PrometheusVariableEditor variable={variable} onChange={setVariable} onQueryResult={onQueryResult} />
                            }
                            {
                                currentDatasource?.type == DatasourceType.ExternalHttp && <HttpVariableEditor variable={variable} onChange={setVariable} onQueryResult={onQueryResult} />
                            }
                            {
                                currentDatasource?.type == DatasourceType.Jaeger && <JaegerVariableEditor variable={variable} onChange={setVariable} onQueryResult={onQueryResult} />
                            }
                             {
                                currentDatasource?.type == DatasourceType.Loki && <LokiVariableEditor variable={variable} onChange={setVariable} onQueryResult={onQueryResult} />
                            }
                        </>
                        }
                    </FormSection>

                    <FormSection title={`${t1.regexFilter} ( ${t.optional} )`} >
                        <EditorInputItem value={variable.regex} placeholder={t1.fitlerTips} onChange={v => {
                            setVariable({ ...variable, regex: v })
                        }} />
                    </FormSection>



                    <FormSection title={t1.varValues} >
                        <Box pt="1">
                            {!isEmpty(variableValues) && variableValues.slice(0, displayCount).map(v => <Tag size="sm" variant="outline" ml="1">{v}</Tag>)}
                        </Box>
                        {variableValues?.length > displayCount && <Button mt="2" size="sm" colorScheme="gray" ml="1" onClick={() => setDisplayCount(displayCount + 30)}>{t.showMore}</Button>}
                    </FormSection>
                </Form>
            </ModalBody>}
            <ModalFooter>
                <Button mr={3} onClick={onClose}>
                    {t.cancel}
                </Button>
                <Button variant='ghost' onClick={() => onSubmit(variable)}>{t.submit}</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
</>)
}