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

import { Box, Button, Center, Flex, HStack, Image, Input, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, SimpleGrid, Switch, Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, useDisclosure } from "@chakra-ui/react"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import { useEffect, useState } from "react"
import { Dashboard, Panel, PanelType } from "types/dashboard"
import EditPanelQuery from "./Query"
import { useImmer } from "use-immer";
import { removeParamFromUrl } from "utils/url";
import { useSearchParam } from "react-use";
// import NodeGraphPanelEditor from "../plugins/panel/nodeGraph/Editor";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import PanelStyles from "./PanelStyles";
import PanelSettings from "./PanelSettings";
import { useLeavePageConfirm } from "hooks/useLeavePage"
import { isEqual } from "lodash"
import useBus, { dispatch } from "use-bus"
import { PanelDataEvent, PanelForceRebuildEvent } from "src/data/bus-events"
import AutoSizer from "react-virtualized-auto-sizer";
import { PanelGrid } from "../grid/PanelGrid"
import loadable from '@loadable/component'
import DatePicker from "components/DatePicker/DatePicker"
import PanelOverrides from "./PanelOverrides"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, panelMsg } from "src/i18n/locales/en"
import EditPanelTransform from "./Transform"
import { getPanelOverridesRules } from "utils/dashboard/panel"

interface EditPanelProps {
    dashboard: Dashboard
    onChange: any
}

const EditPanel = ({ dashboard, onChange }: EditPanelProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(panelMsg)
    const edit = useSearchParam('edit')

    const [tempPanel, setTempPanel] = useImmer<Panel>(null)
    const [rawPanel, setRawPanel] = useState<Panel>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [hideDatasource, setHideDatasource] = useState(false)
    const [pageChanged, setPageChanged] = useState(false)
    const [data, setData] = useState(null)

    useLeavePageConfirm(dashboard.data.enableUnsavePrompt ? pageChanged : false)

    useEffect(() => {
        if (edit) {
            const p = dashboard.data.panels.find(p => p.id.toString() === edit)
            if (p) {
                setTempPanel(p)
                onOpen()
            } else {
                onDiscard()
            }
        }
    }, [edit])

    useEffect(() => {
        if (!tempPanel) {
            // only discarding the current panel can get here
            return
        }

        if (!rawPanel) {
            setRawPanel(tempPanel)
            return
        }

        const changed = !isEqual(rawPanel, tempPanel)
        setPageChanged(changed)
    }, [tempPanel])

    useBus(
        (e) => { return e.type == PanelDataEvent + edit },
        (e) => {
            setData(e.data)
        },
        [edit]
    )



    const onApplyChanges = () => {
        onChange(dashboard => {
            for (var i = 0; i < dashboard.data.panels.length; i++) {
                if (dashboard.data.panels[i].id === tempPanel.id) {
                    dashboard.data.panels[i] = tempPanel
                    break
                }
            }
        })

        if (pageChanged) {
            dispatch(PanelForceRebuildEvent + tempPanel.id)
        }

        setPageChanged(false)
        onEditClose()


    }


    const onDiscard = () => {
        setTempPanel(null)
        setPageChanged(false)
        onEditClose()
    }


    const onEditClose = () => {
        removeParamFromUrl(['edit'])
        setPageChanged(false)
        onClose()
    }

    const maxPanelHeight = () => {
        if (!tempPanel.plugins[tempPanel.type].disableDatasource) {
            if (hideDatasource) {
                return '100%'
            }
            return '50%'
        }
        return '100%'
    }

    const maxDatasourceHeight = () => {
        if (!tempPanel.plugins[tempPanel.type].disableDatasource) {
            if (hideDatasource) {
                return '0%'
            }
            return '50%'
        }
        return '0%'
    }

    const panelOverridesRules = getPanelOverridesRules(tempPanel?.type)
    return (<>
        <Modal isOpen={isOpen} onClose={onEditClose} autoFocus={false} size="full">
            <ModalOverlay />
            {dashboard && tempPanel && <ModalContent>
                {/* editor header section */}
                <ModalHeader>
                    <Flex justifyContent="space-between">
                        <Text>{dashboard.title} / {t1.editPanel}</Text>
                        <HStack spacing={1}>
                            <DatePicker showTime />
                            <ColorModeSwitcher miniMode />
                            <Button variant="outline" onClick={() => { onDiscard(), onClose() }} >{t1.discard}</Button>
                            <Button onClick={onApplyChanges}>{t1.apply}</Button>
                        </HStack>
                    </Flex>
                </ModalHeader>
                <ModalBody>
                    <HStack height="calc(100vh - 100px)" alignItems="top">
                        <Box width="65%" height={`calc(100%)`}>
                            {/* panel rendering section */}
                            <Box height={maxPanelHeight()} id="edit-panel-render" position="relative" >
                                <AutoSizer>
                                    {({ width, height }) => {
                                        if (width === 0) {
                                            return null;
                                        }
                                        return <PanelGrid width={width} height={height} key={tempPanel.id + tempPanel.type} dashboard={dashboard} panel={tempPanel} sync={null} />
                                    }}
                                </AutoSizer>
                                {!tempPanel.plugins[tempPanel.type].disableDatasource && <Box zIndex={1} position="absolute" right="0" bottom={hideDatasource ? "0" : "-35px"} opacity="0.3" cursor="pointer" fontSize=".8rem" onClick={() => { setHideDatasource(!hideDatasource) }}>{hideDatasource ? <FaArrowUp /> : <FaArrowDown />}</Box>}
                            </Box>
                            {/* panel datasource section */}
                            {!tempPanel.plugins[tempPanel.type].disableDatasource &&
                                <Box maxHeight={maxDatasourceHeight()} mt="2" overflowY="scroll">
                                    <Box position="relative" zIndex={0}>
                                        <Tabs variant="unstyled">
                                            <TabList pb="0">
                                                <Tab>{t.query}</Tab>
                                                <Tab>{t.transform}</Tab>
                                            </TabList>
                                            <TabIndicator
                                                mt="3px"
                                                height="2px"
                                                bg="brand.500"
                                                borderRadius="1px"
                                                position="absolute"
                                            />
                                            <TabPanels>
                                                <TabPanel px="0" pt="1">
                                                    <EditPanelQuery key={tempPanel.id + tempPanel.type} panel={tempPanel} onChange={setTempPanel} />
                                                </TabPanel>
                                                <TabPanel px="0" pt="1" pb="0">
                                                    <EditPanelTransform panel={tempPanel} onChange={setTempPanel} />
                                                </TabPanel>
                                            </TabPanels>
                                        </Tabs>

                                    </Box>

                                </Box>}
                        </Box>
                        {/* panel settings section */}
                        <Box width="35%" maxHeight="100%" overflowY={"scroll"}>
                            <Box className="top-gradient-border bordered-left bordered-right" >
                                <Tabs position="relative" variant="unstyled">
                                    <TabList pb="0">
                                        <Tab>{t.panel}</Tab>
                                        <Tab>{t.styles}</Tab>
                                        {panelOverridesRules.length > 0 && <Tab>{t1.overrides}</Tab>}
                                    </TabList>
                                    <TabIndicator
                                        mt="3px"
                                        height="2px"
                                        bg="brand.500"
                                        borderRadius="1px"
                                    />
                                    <TabPanels>
                                        <TabPanel px="0" pt="1">
                                            {/* panel basic setting */}
                                            <PanelSettings panel={tempPanel} onChange={setTempPanel} />

                                            {/* panel rendering plugin setting */}
                                            <CustomPanelEditor tempPanel={tempPanel} setTempPanel={setTempPanel} data={data} />
                                        </TabPanel>
                                        <TabPanel px="0" pt="1" pb="0">
                                            <PanelStyles panel={tempPanel} onChange={setTempPanel} />
                                        </TabPanel>
                                        <TabPanel px="0" pt="1" pb="0">
                                            <PanelOverrides panel={tempPanel} onChange={setTempPanel} data={data} />
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>

                            </Box>

                        </Box>
                    </HStack>
                </ModalBody>
            </ModalContent>}
        </Modal>
    </>)
}

export default EditPanel

//@needs-update-when-add-new-panel
const loadablePanels = {
    [PanelType.Text]: loadable(() => import('../plugins/panel/text/Editor')),
    [PanelType.Graph]: loadable(() => import('../plugins/panel/graph/Editor')),
    [PanelType.Table]: loadable(() => import('../plugins/panel/table/Editor')),
    [PanelType.NodeGraph]: loadable(() => import('../plugins/panel/nodeGraph/Editor')),
    [PanelType.Echarts]: loadable(() => import('../plugins/panel/echarts/Editor')),
    [PanelType.Pie]: loadable(() => import('../plugins/panel/pie/Editor')),
    [PanelType.Gauge]: loadable(() => import('../plugins/panel/gauge/Editor')),
    [PanelType.Stat]: loadable(() => import('../plugins/panel/stat/Editor')),
    [PanelType.Trace]: loadable(() => import('../plugins/panel/trace/Editor')),
    [PanelType.BarGauge]: loadable(() => import('../plugins/panel/barGauge/Editor')),
}

const CustomPanelEditor = ({ tempPanel, setTempPanel, data }) => {
    const Editor = loadablePanels[tempPanel.type]
    if (Editor) {
        return <Editor panel={tempPanel} onChange={setTempPanel} data={data} />
    }

    return null
}