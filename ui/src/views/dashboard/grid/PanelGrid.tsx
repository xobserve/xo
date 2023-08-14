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
import { Dashboard, DatasourceType, Panel, PanelProps, PanelQuery, PanelType } from "types/dashboard"
import { Box, Center, HStack, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, Tooltip, useColorMode, useColorModeValue, useDisclosure, usePrevious, useToast } from "@chakra-ui/react";
import { FaBook, FaBug, FaEdit, FaRegCopy, FaRegEye, FaTrashAlt } from "react-icons/fa";
import { IoMdInformation } from "react-icons/io";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { query_prometheus_alerts, run_prometheus_query } from "../plugins/datasource/prometheus/query_runner";
import { DatasourceMaxDataPoints, DatasourceMinInterval, PANEL_HEADER_HEIGHT, StorageCopiedPanelKey } from "src/data/constants";
import { cloneDeep, isEqual, isFunction } from "lodash";
import { TimeRange } from "types/time";
import { Variable } from "types/variable";
import { hasVariableFormat, replaceQueryWithVariables, replaceWithVariables } from "utils/variable";
import storage from "utils/localStorage";
import useBus, { dispatch } from 'use-bus'
import { getCurrentTimeRange } from "components/DatePicker/TimePicker";
import { PanelDataEvent, PanelForceRebuildEvent, TimeChangedEvent } from "src/data/bus-events";
import { addParamToUrl } from "utils/url";
import { query_testdata_alerts, run_testdata_query } from "../plugins/datasource/testdata/query_runner";
import { run_jaeger_query } from "../plugins/datasource/jaeger/query_runner";
import PanelBorder from "../../../components/largescreen/components/Border";
import TitleDecoration from "components/largescreen/components/TitleDecoration";
import PanelDecoration from "components/largescreen/components/Decoration";
import { useDedupEvent } from "hooks/useDedupEvent";
import loadable from '@loadable/component'
import CodeEditor from "components/CodeEditor/CodeEditor";
import { calculateInterval } from "utils/datetime/range";
import { run_http_query } from "../plugins/datasource/http/query_runner";
import { datasources } from "src/App";
import { useSearchParam } from "react-use";
import React from "react";
import { useStore } from "@nanostores/react";
import { commonMsg, panelMsg } from "src/i18n/locales/en";
import { genDynamicFunction } from "utils/dynamicCode";
import lodash from 'lodash'
import moment from "moment";
import { paletteColorNameToHex } from "utils/colors";
import { isEmpty } from "utils/validate";
import { query_loki_alerts, run_loki_query } from "../plugins/datasource/loki/query_runner";
import { $variables } from "src/views/variables/store";
import { getDatasource } from "utils/datasource";
import { parseVariableFormat } from "utils/format";
import { VariableInterval } from "src/data/variable";
import { datasourceSupportAlerts } from "src/data/alerts";
interface PanelGridProps {
    dashboard: Dashboard
    panel: Panel
    onRemovePanel?: any
    sync: any
    onVariablesChange?: any
    width: number
    height: number
}


export const PanelGrid = memo((props: PanelGridProps) => {
    const [forceRenderCount, setForceRenderCount] = useState(0)
    const [depsInited, setDepsInited] = useState(false)
    const [tr, setTr] = useState<TimeRange>(getCurrentTimeRange())
    const depsCheck = useRef(null)
    const variables = useStore($variables)
    useEffect(() => {
        depsCheck.current = setInterval(() => {
            console.log("check panel refer vars inited", props.panel.id)
            let inited = true
            const vars = $variables.get()
            for (const q of props.panel.datasource.queries) {
                const f = parseVariableFormat(q.metrics)
                for (const v of f) {
                    if (v == VariableInterval) {
                        continue
                    }
                    const variable = vars.find(v1 => v1.name == v)
                    if (variable?.values === undefined) {
                        inited = false
                        return
                    }
                }
            }

            if (inited) {
                setDepsInited(true)
                clearInterval(depsCheck.current)
                depsCheck.current = null
            }
        }, 100)
    }, [])
    useBus(
        (e) => { return e.type == TimeChangedEvent },
        (e) => {
            setTr(e.data)
        }
    )


    useDedupEvent(PanelForceRebuildEvent + props.panel.id, () => {
        console.log("panel is forced to rebuild!", props.panel.id)
        setForceRenderCount(f => f + 1)
    })


    return (
        <PanelBorder width={props.width} height={props.height} border={props.panel.styles?.border}>
            {depsInited && <PanelComponent key={props.panel.id + forceRenderCount} {...props} timeRange={tr} variables={variables} />}
        </PanelBorder>
    )
})

interface PanelComponentProps extends PanelGridProps {
    width: number
    height: number
    timeRange: TimeRange
    variables: Variable[]
}

export const prevQueries = new Map()
export const prevQueryData = new Map()

export const PanelComponent = ({ dashboard, panel, variables, onRemovePanel, width, height, sync, timeRange }: PanelComponentProps) => {
    const toast = useToast()
    const [panelData, setPanelData] = useState<any[]>(null)
    const [queryError, setQueryError] = useState()
    const edit = useSearchParam('edit')
    useEffect(() => {
        return () => {
            // delete data query cache when panel is unmounted
            for (const q of panel.datasource.queries) {
                const id = formatQueryId(panel.datasource.id, dashboard.id, panel.id, q.id, panel.type)
                prevQueries.delete(id)
            }
        }
    }, [])

    useEffect(() => {
        queryData(panel, dashboard.id)
    }, [panel.datasource, timeRange, variables])



    const queryData = async (panel: Panel, dashboardId: string) => {
        console.time("time used - query data for panel:")
        const ds = panel.datasource
        const datasource = getDatasource(ds.id)
        if (!datasource) {
            return
        }


        let data = []
        let needUpdate = false
        const intervalObj = calculateInterval(timeRange, ds.queryOptions.maxDataPoints ?? DatasourceMaxDataPoints, isEmpty(ds.queryOptions.minInterval) ? DatasourceMinInterval : ds.queryOptions.minInterval)
        const interval = intervalObj.intervalMs / 1000
        for (const q0 of ds.queries) {
            const q: PanelQuery = { ...cloneDeep(q0), interval }
            replaceQueryWithVariables(q, datasource.type, intervalObj.interval)
            if (datasource.type != DatasourceType.TestData && hasVariableFormat(q.metrics)) {
                // there are variables still not replaced, maybe because variable's loadValues has not completed
                continue
            }

            const id = formatQueryId(ds.id, dashboardId, panel.id, q.id, panel.type)
            const prevQuery = prevQueries.get(id)
            const currentQuery = [q, timeRange, datasource.type]
            if (isEqual(prevQuery, currentQuery)) {
                const d = prevQueryData[id]
                if (d) {
                    data.push(d)
                }
                setQueryError(null)
                console.log("query data from cache!", panel.id)
                continue
            }

            needUpdate = true
            // console.log("re-query data! metrics id:", q.id, " query id:", queryId)


            let res

            if (panel.type == PanelType.Alert) {
                res = await queryAlerts(panel, timeRange)
            } else {
                //@needs-update-when-add-new-datasource
                switch (datasource.type) {
                    case DatasourceType.Prometheus:
                        res = await run_prometheus_query(panel, q, timeRange, datasource)
                        break;
                    case DatasourceType.TestData:
                        res = await run_testdata_query(panel, q, timeRange, datasource)
                        break;
                    case DatasourceType.Jaeger:
                        res = await run_jaeger_query(panel, q, timeRange, datasource)
                        break;
                    case DatasourceType.ExternalHttp:
                        res = await run_http_query(panel, q, timeRange, datasource)
                        break;
                    case DatasourceType.Loki:
                        res = await run_loki_query(panel, q, timeRange, datasource)
                        break
                    default:
                        break;
                }
            }


            setQueryError(res.error)



            if (!isEmpty(res.data)) {
                data.push(res.data)
                prevQueryData[id] = res.data
                prevQueries.set(id, currentQuery)
            }
        }

        if (needUpdate) {
            console.log("query data and set panel data:", panel.id, data)
            setPanelData(data)
        } else {
            if (!isEqual(panelData, data)) {
                setPanelData(data)
            }
        }

        if (edit == panel.id.toString()) {
            dispatch({ type: PanelDataEvent + panel.id, data: data })
        }

        console.timeEnd("time used - query data for panel:")
    }


    const onCopyPanel = useCallback((panel) => {
        toast({
            title: "Copied",
            description: "Panel copied, you can use it through **Add Panel** button",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        storage.set(StorageCopiedPanelKey, panel)
    }, [])

    const panelBodyHeight = height - PANEL_HEADER_HEIGHT
    const panelInnerHeight = isEmpty(panel.title) ? height : panelBodyHeight// 10px padding top and bottom of panel body
    const panelInnerWidth = width // 10px padding left and right of panel body

    console.log("panel grid rendered, panel data: ", panelData)
    const data = useMemo(() => {
        if (panel.enableTransform && panelData) {
            const transform = genDynamicFunction(panel.transform);
            if (isFunction(transform)) {
                const tData = transform(panelData, lodash, moment)
                console.log("panel grid rendered, transform data: ", tData)
                return tData
            } else {
                return panelData
            }
        }
        return panelData
    }, [panel.transform, panel.enableTransform, panelData])

    return <Box height={height} width={width} className={panel.styles.border == "None" ? "hover-bordered" : null} border="1px solid transparent" position="relative">
        <PanelHeader panel={panel} data={data} queryError={queryError} onCopyPanel={onCopyPanel} onRemovePanel={onRemovePanel} />
        {data && <Box
            // panel={panel}
            height={panelInnerHeight}
            overflowY="scroll"
            marginLeft={panel.type == PanelType.Graph ? "-10px" : "0px"}
        >
            <CustomPanelRender dashboardId={dashboard.id} panel={panel} data={data} height={panelInnerHeight} width={panelInnerWidth} sync={sync} timeRange={timeRange} />
        </Box>}
    </Box>
}



//@needs-update-when-add-new-panel
const loadablePanels = {
    [PanelType.Text]: loadable(() => import('../plugins/panel/text/Text')),
    [PanelType.Graph]: loadable(() => import('../plugins/panel/graph/Graph')),
    [PanelType.Table]: loadable(() => import('../plugins/panel/table/Table')),
    [PanelType.NodeGraph]: loadable(() => import('../plugins/panel/nodeGraph/NodeGraph')),
    [PanelType.Echarts]: loadable(() => import('../plugins/panel/echarts/Echarts')),
    [PanelType.Pie]: loadable(() => import('../plugins/panel/pie/Pie')),
    [PanelType.Gauge]: loadable(() => import('../plugins/panel/gauge/Gauge')),
    [PanelType.Stat]: loadable(() => import('../plugins/panel/stat/Stat')),
    [PanelType.Trace]: loadable(() => import('../plugins/panel/trace/Trace')),
    [PanelType.BarGauge]: loadable(() => import('../plugins/panel/barGauge/BarGauge')),
    [PanelType.GeoMap]: loadable(() => import('../plugins/panel/geomap/GeoMap')),
    [PanelType.Log]: loadable(() => import('../plugins/panel/log/Log')),
    [PanelType.Bar]: loadable(() => import('../plugins/panel/bar/Bar')),
    [PanelType.Alert]: loadable(() => import('../plugins/panel/alert/Alert')),
}

const CustomPanelRender = memo((props: PanelProps) => {
    const P = loadablePanels[props.panel.type]
    if (P) {
        return <P {...props} />
    }

    return <></>
})

interface PanelHeaderProps {
    queryError: string
    panel: Panel
    onCopyPanel: (panel: Panel) => void
    onRemovePanel: (panel: Panel) => void
    data: any[]
}

const PanelHeader = ({ queryError, panel, onCopyPanel, onRemovePanel, data }: PanelHeaderProps) => {
    const viewPanel = useSearchParam("viewPanel")
    const t = useStore(commonMsg)
    const t1 = useStore(panelMsg)
    const title = replaceWithVariables(panel.title)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { colorMode } = useColorMode()
    return (
        <>
            <HStack className="grid-drag-handle hover-bg" height={`${PANEL_HEADER_HEIGHT - (isEmpty(title) ? 15 : 0)}px`} cursor="move" spacing="0" position={isEmpty(title) ? "absolute" : "relative"} width="100%" zIndex={1000}>
                {(queryError || panel.desc) && <Box color={useColorModeValue(queryError ? "red" : "brand.500", queryError ? "red" : "brand.200")} position="absolute">
                    <Tooltip label={queryError ?? replaceWithVariables(panel.desc)}>
                        <Box>
                            <IoMdInformation fontSize="20px" cursor="pointer" />
                        </Box>
                    </Tooltip>
                </Box>}
                <Center width="100%">
                    <Menu placement="bottom">
                        <MenuButton
                            transition='all 0.2s'
                            _focus={{ border: null }}
                            onClick={e => e.stopPropagation()}
                        >
                            <Center width="100%">{!isEmpty(title) ? <Box cursor="pointer" className="hover-bordered" paddingTop={panel.styles.title.paddingTop} paddingBottom={panel.styles.title.paddingBottom} paddingLeft={panel.styles.title.paddingLeft} paddingRight={panel.styles.title.paddingRight} width="100%" fontSize={panel.styles.title.fontSize} fontWeight={panel.styles.title.fontWeight} color={paletteColorNameToHex(panel.styles.title.color, colorMode)}><TitleDecoration styles={panel.styles}><Text noOfLines={1}>{title}</Text></TitleDecoration></Box> : <Box width="100px">&nbsp;</Box>}</Center>
                        </MenuButton>
                        <MenuList p="1">
                            <MenuItem icon={<FaEdit />} onClick={() => addParamToUrl({ edit: panel.id })}>{t.edit}</MenuItem>
                            <MenuItem icon={<FaRegCopy />} onClick={() => onCopyPanel(panel)}>{t.copy}</MenuItem>
                            <MenuDivider my="1" />
                            <MenuItem icon={<FaBug />} onClick={onOpen}>{t1.debugPanel}</MenuItem>
                            <MenuItem icon={<FaRegEye />} onClick={() => addParamToUrl({ viewPanel: viewPanel ? null : panel.id })}>{viewPanel ? t1.exitlView : t1.viewPanel}</MenuItem>
                            <MenuDivider my="1" />
                            <MenuItem icon={<FaTrashAlt />} onClick={() => onRemovePanel(panel)}>{t.remove}</MenuItem>
                        </MenuList>
                    </Menu>
                </Center>
                <Box display="none"><FaBook className="grid-drag-handle" /></Box>
            </HStack>
            <PanelDecoration decoration={panel.styles.decoration} />
            {isOpen && <DebugPanel panel={panel} isOpen={isOpen} onClose={onClose} data={data} />}
        </>
    )
}

const DebugPanel = ({ panel, isOpen, onClose, data }) => {
    const [tabIndex, setTabIndex] = useState(0)


    return (<Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth="800px">
            <ModalCloseButton />
            <ModalBody>
                <Tabs onChange={(index) => setTabIndex(index)} >
                    <TabList>
                        <Tab>Panel JSON</Tab>
                        <Tab>Panel Data</Tab>
                    </TabList>
                    <TabPanels p="1">
                        <TabPanel h="600px">
                            <CodeEditor value={JSON.stringify(panel, null, 2)} language="json" readonly />
                        </TabPanel>
                        <TabPanel h="600px">
                            <CodeEditor value={JSON.stringify(data, null, 2)} language="json" readonly />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ModalBody>
        </ModalContent>
    </Modal>
    )
}

const formatQueryId = (datasourceId, dashboardId, panelId, queryId, panelType) => {
    // because some panels has their own data parser in datasource query runner
    // so we need to use panel type to make the cache working correctly
    let tp;
    switch (panelType) {
        case PanelType.NodeGraph:
            tp = PanelType.NodeGraph
            break;
        case PanelType.Trace:
            tp = PanelType.Trace
            break
        case PanelType.GeoMap:
            tp = PanelType.GeoMap
            break
        case PanelType.Log:
            tp = PanelType.Log
            break
        case PanelType.Alert:
            tp = PanelType.Alert
            break
        default:
            tp = "seriesData"
            break;
    }
    return `${datasourceId}-${dashboardId}-${panelId}-${queryId}-${tp}`
}

const queryAlerts = async (panel: Panel, timeRange: TimeRange) => {
    let result = {
        error: null,
        data: []
    }
    for (const dsID of panel.plugins.alert.filter.datasources) {
        const ds = datasources.find(ds => ds.id === dsID)
        let res
        switch (ds.type) {
            case DatasourceType.Prometheus:
                res = await query_prometheus_alerts(panel, timeRange, ds)
                break;
            case DatasourceType.Loki:
                res = await query_loki_alerts(panel, timeRange, ds)
                break
            case DatasourceType.TestData:
                res = query_testdata_alerts(panel, timeRange, ds)
                break
            case DatasourceType.ExternalHttp:
                res = await run_http_query(panel, panel.plugins.alert.filter.httpQuery, timeRange, ds)
                res.data.fromDs = ds.type
                console.log("here33333:", res)
                break
            default:
                break;
        }


        result.error = res.error

        result.data = result.data.concat(res.data)
    }

    return result
}