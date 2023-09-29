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

import { Box, Button, Flex, HStack, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure, useMediaQuery, useToast } from "@chakra-ui/react"
import { ColorModeSwitcher } from "src/components/ColorModeSwitcher"
import { memo, useCallback, useEffect, useState } from "react"
import { Dashboard, Panel, PanelType } from "types/dashboard"
import EditPanelQuery from "./DatasourceQuery"
import { useImmer } from "use-immer";
import { removeParamFromUrl } from "utils/url";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import PanelStyles from "./PanelStyles";
import PanelSettings from "./PanelSettings";
import { useLeavePageConfirm } from "hooks/useLeavePage"
import { cloneDeep, find, isEqual, orderBy } from "lodash"
import useBus, { dispatch } from "use-bus"
import { DashboardSavedEvent, OnDashboardSaveEvent, PanelDataEvent, PanelForceRebuildEvent, SaveDashboardEvent } from "src/data/bus-events"
import AutoSizer from "react-virtualized-auto-sizer";
import { PanelGrid } from "../grid/PanelGrid/PanelGrid"
import DatePicker from "src/components/DatePicker/DatePicker"
import PanelOverrides from "./PanelOverrides"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, panelMsg } from "src/i18n/locales/en"
import EditPanelTransform from "./Transform"
import { getPanelOverridesRules } from "utils/dashboard/panel"
import ValueMapping from "src/views/dashboard/plugins/components/ValueMapping/ValueMapping"
import PanelAccordion from "./Accordion"
import storage from "utils/localStorage"
import EditPanelAlert from "./Alert"
import { useLocation, useSearchParam } from "react-use"
import { useLandscapeMode } from "hooks/useLandscapeMode"
import { GRID_COLUMN_COUNT, MobileBreakpoint } from "src/data/constants"
import { isEmpty } from "utils/validate"
import { translateGridHeightToScreenHeight } from "../grid/DashboardGrid"
import { $variables } from "src/views/variables/store"
import CustomScrollbar from "components/CustomScrollbar/CustomScrollbar"
import SelectVariables from "src/views/variables/SelectVariable"
import { externalPanelPlugins } from "../plugins/external/plugins"
import ErrorBoundary from "components/ErrorBoudary"
import { builtinPanelPlugins } from "../plugins/built-in/plugins"

interface EditPanelProps {
    dashboard: Dashboard
    onChange: any
    edit?: string
}

const StorageHideDsKey = "hide-ds-"

const EditPanelWrapper = memo((props: EditPanelProps) => {
    const edit = useSearchParam('edit')
    useLocation()
    return <EditPanel {...props} edit={edit} />
})

export default EditPanelWrapper

const EditPanel = memo(({ dashboard, onChange, edit }: EditPanelProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(panelMsg)

    const vars = useStore($variables)
    const [tempPanel, setTempPanel] = useImmer<Panel>(null)
    const [rawPanel, setRawPanel] = useState<Panel>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [hideDatasource, setHideDatasource] = useState(false)
    const [pageChanged, setPageChanged] = useState(false)
    const [data, setData] = useState(null)
    const [view, setView] = useState<"fill" | "actual">("fill")

    useLandscapeMode(!isEmpty(edit))

    useBus(
        DashboardSavedEvent,
        () => {
            setPageChanged(false)
        },
        []
    )

    useBus(
        OnDashboardSaveEvent,
        () => {
            if (edit) {
                onChange(dashboard => {
                    for (var i = 0; i < dashboard.data.panels.length; i++) {
                        if (dashboard.data.panels[i].id === tempPanel.id) {
                            dashboard.data.panels[i] = tempPanel
                            break
                        }
                    }
                })
                setTimeout(() => dispatch(SaveDashboardEvent), 300)
            }
        },
        [tempPanel]
    )

    useEffect(() => {
        if (edit) {
            const p = dashboard.data.panels.find(p => p.id.toString() === edit)
            if (p) {
                setTempPanel(p)
                onOpen()
                const hide = storage.get(StorageHideDsKey + dashboard.id + p.id)
                if (hide !== undefined) {
                    setHideDatasource(hide)
                }
            } else {
                onDiscard()
            }
        } else {
            if (!pageChanged) {
                setTempPanel(null)
                onClose()
            }
        }
    }, [edit])

    useEffect(() => {
        if (!tempPanel) {
            // only discarding the current panel can get here
            return
        }

        if (!rawPanel) {
            setRawPanel(cloneDeep(tempPanel))
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

    const panelOverridesRules = getPanelOverridesRules(tempPanel?.type, externalPanelPlugins)
    const onValueMappingChange = useCallback((v) => {
        setTempPanel((tempPanel: Panel) => {
            tempPanel.valueMapping = v
        })
    }, [])
    const onTempPanelChange = useCallback((panel: Panel) => {
        setTempPanel(panel)
    }, [])

    let enableValueMapping = false
    switch (tempPanel?.type) {
        case PanelType.Table:
            enableValueMapping = true
            break
        default:
            break;
    }

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)

    let w
    let h
    if (tempPanel && view == "actual") {
        const ele = document.getElementById("dashboard-grid")
        const gridW = ele?.offsetWidth
        w = gridW * (tempPanel.gridPos.w / GRID_COLUMN_COUNT)
        h = translateGridHeightToScreenHeight(tempPanel.gridPos.h)

        const ele1 = document.getElementById("edit-panel-render")
        const maxW = ele1?.offsetWidth
        const maxH = ele1?.offsetHeight

        if (maxW && w > maxW) {
            w = maxW
        }
        if (maxH && w > maxH) {
            h = maxH
        }
    }


    const dvars = orderBy(vars.filter((v) => v.id.toString().startsWith("d-")), ['sortWeight', 'name'], ['desc', 'asc'])
    const gvars = orderBy(vars.filter((v) => !v.id.toString().startsWith("d-") && !find(dashboard.data.hidingVars?.split(','), v1 => v.name.toLowerCase().match(v1))), ['sortWeight', 'name'], ['desc', 'asc'])
    return (<>
        <Modal isOpen={isOpen} onClose={onEditClose} autoFocus={false} size="full">
            <ModalOverlay />
            {dashboard && tempPanel &&

                <ModalContent>
                    {/* editor header section */}
                    <ModalHeader px="3" pt="3" pb="0">
                        <Flex justifyContent="space-between">
                            {isLargeScreen ? <Text>{dashboard.title} / {t1.editPanel}</Text> : <Text>{t1.editPanel}</Text>}
                            <HStack spacing={0}>
                                <Button size="sm" variant={view == "fill" ? "solid" : "outline"} colorScheme="gray" onClick={() => setView("fill")}>Fill</Button>
                                <Button size="sm" variant={view == "actual" ? "solid" : "outline"} colorScheme="gray" onClick={() => setView("actual")}>Actual</Button>
                            </HStack>
                            <HStack spacing={1}>
                                <DatePicker showTime showRealTime />
                                <ColorModeSwitcher miniMode disableTrigger />
                                <Button size={isLargeScreen ? "md" : "sm"} variant="outline" onClick={() => { onDiscard(), onClose() }} >{t1.discard}</Button>
                                <Button size={isLargeScreen ? "md" : "sm"} onClick={onApplyChanges}>{t1.apply}</Button>
                            </HStack>
                        </Flex>
                    </ModalHeader>
                    <ModalBody pt={isLargeScreen ? 1 : 0}>
                        <ErrorBoundary>
                            <HStack height="calc(100vh - 80px)" alignItems="top">
                                <Box width="65%" height={`calc(100% - 20px)`}>
                                    {!isEmpty(vars) &&
                                        <Flex mt="0" maxW={`calc(100% - ${10}px)`}>
                                            <CustomScrollbar hideVerticalTrack>
                                                <Flex justifyContent="space-between" >
                                                    <SelectVariables variables={dvars} />
                                                    <SelectVariables variables={gvars} />
                                                </Flex>
                                            </CustomScrollbar>
                                        </Flex>}
                                    {/* panel rendering section */}
                                    <Box height={maxPanelHeight()} id="edit-panel-render" position="relative" >
                                        {view == "fill" ? <AutoSizer>
                                            {({ width, height }) => {
                                                if (width === 0) {
                                                    return null;
                                                }


                                                return <PanelGrid width={width} height={height} key={tempPanel.id + tempPanel.type} dashboard={dashboard} panel={tempPanel} sync={null} />
                                            }}
                                        </AutoSizer> :
                                            <Box width="100%" display="flex" justifyContent={"center"}>
                                                <PanelGrid width={w} height={h} key={tempPanel.id + tempPanel.type} dashboard={dashboard} panel={tempPanel} sync={null} />
                                            </Box>}
                                        {!tempPanel.plugins[tempPanel.type].disableDatasource && <Box zIndex={1} position="absolute" right="0" bottom={hideDatasource ? "0" : "-35px"} opacity={hideDatasource ? 0.8 : 0.4} cursor="pointer" className={`hover-text ${hideDatasource ? "color-text" : null}`} fontSize=".8rem" onClick={() => { setHideDatasource(!hideDatasource); storage.set(StorageHideDsKey + dashboard.id + tempPanel.id, !hideDatasource) }}>{hideDatasource ? <FaArrowUp /> : <FaArrowDown />}</Box>}
                                    </Box>
                                    {/* panel datasource section */}
                                    {!tempPanel.plugins[tempPanel.type].disableDatasource &&
                                        <Box maxHeight={maxDatasourceHeight()} mt="2" overflowY="auto">
                                            <Box position="relative" zIndex={0}>
                                                <Tabs variant="unstyled" isLazy>
                                                    <TabList pb="0">
                                                        <Tab>{t.query}</Tab>
                                                        <Tab>{t.transform}</Tab>
                                                        {tempPanel.type == PanelType.Graph && tempPanel.plugins.graph.enableAlert && <Tab>{t.alert}</Tab>}
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
                                                        {tempPanel.type == PanelType.Graph && tempPanel.plugins.graph.enableAlert &&
                                                            <TabPanel px="0" pt="1" pb="0">
                                                                <EditPanelAlert panel={tempPanel} onChange={setTempPanel} />
                                                            </TabPanel>}
                                                    </TabPanels>
                                                </Tabs>

                                            </Box>

                                        </Box>}
                                </Box>
                                {/* panel settings section */}
                                <Box width="35%" maxHeight="100%" overflowY={"auto"} zIndex={1}>
                                    <Box className="top-gradient-border bordered-left bordered-right" >
                                        <Tabs position="relative" variant="unstyled">
                                            <TabList pb="0">
                                                <Tab>{t.panel}</Tab>
                                                <Tab>{t.styles}</Tab>
                                                {panelOverridesRules.length > 0 && <Tab>{t1.overrides}  {(tempPanel.overrides.length > 0 && isLargeScreen) && <Text textStyle="annotation">&nbsp; ({tempPanel.overrides.length}/{tempPanel.overrides.reduce((t, v) => t + v.overrides.length, 0)})</Text>}</Tab>}
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
                                                    <PanelSettings panel={tempPanel} onChange={onTempPanelChange} />

                                                    {/* panel rendering plugin setting */}
                                                    <CustomPanelEditor tempPanel={tempPanel} setTempPanel={onTempPanelChange} data={data} />

                                                    {enableValueMapping && <PanelAccordion title={t.valueMapping} defaultOpen>
                                                        <ValueMapping value={tempPanel.valueMapping} onChange={onValueMappingChange} />
                                                    </PanelAccordion>}

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
                        </ErrorBoundary>
                    </ModalBody>
                </ModalContent>
            }
        </Modal>
        {edit && dashboard.data.enableUnsavePrompt && <PageLeave pageChanged={pageChanged} />}
    </>)
})


interface CustomPanelEditorProps {
    tempPanel: Panel
    setTempPanel: any
    data: any
}

const CustomPanelEditor = memo(({ tempPanel, setTempPanel, data }: CustomPanelEditorProps) => {
    const toast = useToast()

    const p = builtinPanelPlugins[tempPanel.type] ?? externalPanelPlugins[tempPanel.type]
    if (!p) {
        const toastId = `panel type <${tempPanel.type}> not exist, maybe you need to re-install this plugin`
        if (!toast.isActive(toastId)) {
            toast({
                id: toastId,
                title: toastId,
                status: "error",
                duration: 5000
            })
        }
      
        return null
    }
    const ExternalPluginEditor = p.editor
    if (ExternalPluginEditor) {
        return <ExternalPluginEditor panel={tempPanel} onChange={setTempPanel} data={data} />
    }
    return null
})


const PageLeave = ({ pageChanged }) => {
    useLeavePageConfirm(pageChanged)
    return <></>
}