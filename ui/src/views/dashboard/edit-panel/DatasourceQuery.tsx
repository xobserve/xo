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
import { Box, Button, Flex, HStack, Image, Text, Tooltip, VStack, Drawer, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, useDisclosure, DrawerBody, Tabs, TabList, TabPanels, TabPanel, Tab, useColorMode } from "@chakra-ui/react"
import { useState } from "react"
import { FaAngleDown, FaAngleRight, FaBookOpen, FaEye, FaEyeSlash, FaPlus, FaTrashAlt } from "react-icons/fa"
import {  Panel, PanelQuery } from "types/dashboard"
import { initDatasource } from "src/data/panel/initPanel"
import { EditorInputItem, EditorNumberItem } from "src/components/editor/EditorItem"
import { calculateInterval } from "utils/datetime/range"
import { getCurrentTimeRange } from "src/components/DatePicker/TimePicker"

import FormItem from "src/components/form/Item"
import { FormSection } from "src/components/form/Form"
import React from "react";
import { commonMsg, panelMsg } from "src/i18n/locales/en"
import { useStore } from "@nanostores/react"
import { isEmpty } from "utils/validate"
import { DatasourceMinInterval } from "src/data/constants"
import DatasourceSelect from "src/components/datasource/Select"
import { getDatasource } from "utils/datasource"
import { isNumber } from "lodash"
import { $datasources } from "src/views/datasource/store"
import { externalDatasourcePlugins } from "../plugins/external/plugins"
import { MarkdownRender } from "components/markdown/MarkdownRender"
import Toc from "components/Toc/Toc"
import { builtinDatasourcePlugins } from "../plugins/built-in/plugins"

interface Props {
    panel: Panel
    onChange: any
}

const EditPanelQuery = (props: Props) => {
    const t = useStore(commonMsg)
    const { isOpen: isDocsOpen, onOpen: onDocsOpen, onClose: onDocsClose } = useDisclosure()
    const [docsTab, setDocsTab] = useState(0)
    const { colorMode } = useColorMode()
    const { panel, onChange } = props
    const selectDatasource = (id) => {
        const datasources = $datasources.get()
        onChange((panel: Panel) => {
            const panelDs = datasources.find(ds => ds.id == panel.datasource.id)
            const newDs = datasources.find(ds => ds.id == id)
            if (panelDs?.type == newDs.type) {
                panel.datasource = { ...panel.datasource, id: id }
            } else {
                panel.datasource = { ...initDatasource, id: id }
            }

        })
    }

    const onAddQuery = () => {
        onChange((panel: Panel) => {
            const ds = panel.datasource
            if (!ds.queries) {
                ds.queries = []
            }

            let id = 65; // from 'A' to 'Z'
            for (const q of ds.queries) {
                if (q.id >= id) {
                    id = q.id + 1
                }
            }


            ds.queries.push({
                id: id,
                metrics: "",
                legend: "",
                visible: true,
                data: {}
            })
        })
    }

    const removeQuery = id => {
        onChange((panel: Panel) => {
            const ds = panel.datasource
            if (!ds.queries) {
                ds.queries = []
            }

            ds.queries = ds.queries.filter(q => q.id != id)
        })
    }

    const onVisibleChange = (id, visible) => {
        onChange((panel: Panel) => {
            const ds = panel.datasource
            for (var i = 0; i < ds.queries.length; i++) {
                if (ds.queries[i].id === id) {
                    ds.queries[i].visible = visible
                    break
                }
            }
        })
    }
    const currentDatasource = getDatasource(panel.datasource.id)
    const plugin = builtinDatasourcePlugins[currentDatasource?.type] ?? externalDatasourcePlugins[currentDatasource?.type]
    const dsIcon = plugin?.settings.icon

    let docs: { tab: string, content: string, toc: { level: string; content: string }[] }[] = [];;
    if (plugin && plugin.getDocs) {
        docs = plugin.getDocs()
    }

    return (<>
        <Box className="bordered-top" p="2" borderRadius="0" height="100%">
            <Flex justifyContent="space-between" alignItems="start">
                <HStack>
                    <Image width="30px" height="30px" src={dsIcon} />
                    <Box width="200px"><DatasourceSelect value={panel.datasource.id} onChange={selectDatasource} variant="unstyled" /></Box>
                    {!isNumber(panel.datasource.id) && <Text textStyle="annotation">current: {currentDatasource?.name}</Text>}
                    {docs && docs.length > 0 && <Tooltip label={`View ${currentDatasource?.type} docs`}><Box opacity={0.8} cursor="pointer" onClick={onDocsOpen}><FaBookOpen className={colorMode == "light" ? "color-text" : null} /></Box></Tooltip>}
                </HStack>
                <DatasourceQueryOption {...props} />
            </Flex>

            <VStack alignItems="left" mt="3" spacing="2">
                {panel.datasource.queries?.map((query, index) => {
                    return <Box key={index} className="bordered" p="1" pb="2">
                        <Flex justifyContent="space-between" py="0" px="2" mb="1">
                            <Text className="color-text">{String.fromCharCode(query.id)}</Text>
                            <HStack layerStyle="textSecondary" fontSize="12px" spacing={3}>
                                {query.visible ? <FaEye cursor="pointer" onClick={() => onVisibleChange(query.id, false)} /> : <FaEyeSlash cursor="pointer" onClick={() => onVisibleChange(query.id, true)} />}
                                <FaTrashAlt cursor="pointer" onClick={() => removeQuery(query.id)} />
                            </HStack>
                        </Flex>
                        {
                            <Box px="2" pt="2"><CustomQueryEditor key={panel.datasource.id + query.id} panel={panel} query={query} selected={panel.datasource} dsType={currentDatasource?.type} onChange={onChange} /></Box>
                        }
                    </Box>
                })}
            </VStack>
            <Button leftIcon={<FaPlus />} size="sm" variant="outline" onClick={onAddQuery} mt="4">{t.query}</Button>
        </Box>

        <Drawer
            isOpen={isDocsOpen}
            placement='right'
            onClose={onDocsClose}
            size="lg"
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                {/* <DrawerHeader>{upperFirst(currentDatasource?.type)} Docs</DrawerHeader> */}
                <DrawerBody width="100%" pl="0">
                    <Tabs isLazy defaultIndex={docsTab} onChange={(index) => { setDocsTab(index) }} >
                        <TabList>
                            {
                                docs.map((d, index) => {
                                    return <Tab key={index}>{d.tab}</Tab>
                                })
                            }
                        </TabList>
                        <TabPanels >
                            {
                                docs.map((d, index) => {
                                    return <TabPanel pl="0">
                                        {d.toc && <Box position="fixed" top="0" ml="0px" transform='translateX(-100%)'>
                                            <Toc toc={d.toc} />
                                        </Box>}

                                        <Box pl="6">
                                            <MarkdownRender md={d.content} width="100%" />
                                        </Box>
                                    </TabPanel>
                                })
                            }
                        </TabPanels>
                    </Tabs>

                </DrawerBody>
            </DrawerContent>
        </Drawer>
    </>)
}

export default EditPanelQuery


const DatasourceQueryOption = ({ panel, onChange }: Props) => {
    const t1 = useStore(panelMsg)
    const [expanded, setExpanded] = useState(false)
    return (
        <VStack alignItems="end" mt="8px">

            <HStack className="color-text" fontSize=".9rem" spacing={1} cursor="pointer" onClick={() => setExpanded(!expanded)} width="fit-content">
                {expanded ? <FaAngleDown /> : <FaAngleRight />}
                <Text fontWeight="500">{t1.queryOption}</Text>
            </HStack>
            {
                expanded && <FormSection mt="1" position="relative">
                    <FormItem size="sm" labelWidth="170px" title={t1.maxDataPoints} desc={t1.maxDataPointsTips}>
                        <Box width="100px"><EditorNumberItem min={1} max={2000} step={20} value={panel.datasource.queryOptions.maxDataPoints} onChange={v => {
                            onChange((panel: Panel) => {
                                panel.datasource.queryOptions.maxDataPoints = v
                            })
                        }} /></Box>

                    </FormItem>
                    <FormItem title={t1.minInterval} labelWidth="170px" size="sm" desc={t1.minIntervalTips}>
                        <Box width="100px"><EditorInputItem value={panel.datasource.queryOptions.minInterval} onChange={v => {
                            onChange((panel: Panel) => {
                                panel.datasource.queryOptions.minInterval = v
                            })
                        }} placeholder="15s" /></Box>
                    </FormItem>

                    <FormItem labelWidth="170px" size="sm" title={t1.finalInterval} desc={t1.finalIntervalTips} alignItems="center">
                        <Text width="100px" pl="2" fontSize="0.9rem">{calculateInterval(getCurrentTimeRange(), panel.datasource.queryOptions.maxDataPoints, isEmpty(panel.datasource.queryOptions.minInterval) ? DatasourceMinInterval : panel.datasource.queryOptions.minInterval).interval}</Text>
                    </FormItem>
                </FormSection>
            }
        </VStack>
    )
}
const CustomQueryEditor = ({ panel, query, onChange, selected, dsType }) => {
    const onQueryChange = (query: PanelQuery) => {
        onChange((panel: Panel) => {
            const ds = panel.datasource
            for (var i = 0; i < ds.queries.length; i++) {
                if (ds.queries[i].id === query.id) {
                    ds.queries[i] = query
                    break
                }
            }
        })
    }

    const p = builtinDatasourcePlugins[dsType] ?? externalDatasourcePlugins[dsType]
    if (p && p.queryEditor) {
        return <p.queryEditor datasource={selected} query={query} onChange={onQueryChange} panel={panel} />
    }
    return <></>

}
