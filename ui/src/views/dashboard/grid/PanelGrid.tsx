import { Dashboard, DatasourceType, Panel, PanelQuery, PanelType } from "types/dashboard"
import { Box, Center, HStack, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, Tooltip, useColorModeValue, useDisclosure, useToast } from "@chakra-ui/react";
import { FaBook, FaBug, FaEdit, FaRegCopy, FaTrashAlt } from "react-icons/fa";
import { IoMdInformation } from "react-icons/io";
import { memo, useCallback, useEffect, useState } from "react";
import { run_prometheus_query } from "../plugins/datasource/prometheus/query_runner";
import { DatasourceMaxDataPoints, DatasourceMinInterval, PANEL_HEADER_HEIGHT, StorageCopiedPanelKey } from "src/data/constants";
import { cloneDeep, isEmpty, isEqual } from "lodash";
import { TimeRange } from "types/time";
import { Variable } from "types/variable";
import { replaceQueryWithVariables, replaceWithVariables } from "utils/variable";
import storage from "utils/localStorage";
import useBus, { dispatch } from 'use-bus'
import { getInitTimeRange } from "components/DatePicker/TimePicker";
import { PanelDataEvent, PanelForceRebuildEvent, TimeChangedEvent, VariableChangedEvent } from "src/data/bus-events";
import { variables } from "../Dashboard";
import { addParamToUrl } from "utils/url";
import { run_testdata_query } from "../plugins/datasource/testdata/query_runner";
import { run_jaeger_query } from "../plugins/datasource/jaeger/query_runner";
import PanelBorder from "../../../components/largescreen/components/Border";
import TitleDecoration from "components/largescreen/components/TitleDecoration";
import PanelDecoration from "components/largescreen/components/Decoration";
import { useDedupEvent } from "hooks/useDedupEvent";
import loadable from '@loadable/component'
import CodeEditor from "components/CodeEditor/CodeEditor";
import { calculateInterval } from "utils/datetime/range";
import { run_http_query } from "../plugins/datasource/http/query_runner";
import { datasources } from "src/views/App";
import { useSearchParam } from "react-use";


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

    const [tr, setTr] = useState<TimeRange>(getInitTimeRange())

    useBus(
        (e) => { return e.type == TimeChangedEvent },
        (e) => {
            console.log("here33333, time changed!", props.panel.id)
            setTr(e.data)
        }
    )

    const [variables1, setVariables] = useState<Variable[]>(variables)
    useBus(
        VariableChangedEvent,
        () => {
            setVariables([...variables])
        }
    )


    useDedupEvent(PanelForceRebuildEvent + props.panel.id, () => {
        console.log("here33333, panel is forced to rebuild!", props.panel.id)
        setForceRenderCount(f => f + 1)
    })


    return (
        <PanelBorder width={props.width} height={props.height} border={props.panel.styles?.border}>
            <PanelComponent key={props.panel.id + forceRenderCount} {...props} timeRange={tr} variables={variables1} />
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

export const PanelComponent = ({ dashboard, panel, onRemovePanel, width, height, sync, timeRange, variables }: PanelComponentProps) => {
    const toast = useToast()
    const [panelData, setPanelData] = useState<any[]>(null)
    const [queryError, setQueryError] = useState()
    const edit = useSearchParam('edit')
    useEffect(() => {
        return () => {
            // delete data query cache when panel is unmounted
            for (const q of panel.datasource.queries) {
                const id = formatQueryId(panel.datasource.id, dashboard.id, panel.id, q.id)
                delete prevQueries[id]
            }
        }
    }, [])

    useEffect(() => {
        queryData(panel, dashboard.id)
    }, [panel.datasource, timeRange, variables])


    const queryData = async (panel: Panel, dashboardId: string) => {
        console.time("time used - query data for panel:")
        const ds = panel.datasource
        const datasource = datasources.find(d => d.id == ds.id)
        if (!datasource) {
            return
        }


        let data = []
        let needUpdate = false
        const interval = calculateInterval(timeRange, ds.queryOptions.maxDataPoints ?? DatasourceMaxDataPoints, ds.queryOptions.minInterval ?? DatasourceMinInterval).intervalMs / 1000
        for (const q0 of ds.queries) {
            const q: PanelQuery = { ...cloneDeep(q0), interval }
            replaceQueryWithVariables(q, ds.type)
            const id = formatQueryId(ds.id, dashboardId, panel.id, q.id)
            const prevQuery = prevQueries.get(id)
            const currentQuery = [q, timeRange]

            if (isEqual(prevQuery, currentQuery)) {
                const d = prevQueryData[id]
                if (d) {
                    data.push(d)
                }
                continue
            }

            needUpdate = true
            // console.log("re-query data! metrics id:", q.id, " query id:", queryId)

            prevQueries.set(id, currentQuery)
            let res

            //@needs-update-when-add-new-datasource
            switch (ds.type) {
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
                default:
                    break;
            }

            if (res.error) {
                setQueryError(res.error)
            } else {
                setQueryError(null)
            }


            if (!isEmpty(res.data)) {
                data.push(res.data)
                prevQueryData[id] = res.data
            }
        }

        if (needUpdate) {
            console.log("query and set panel data:", panel.id)
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
    const panelInnerWidth = width + 8 // 10px padding left and right of panel body


    console.log("panel grid rendered, data: ", panelData)
    return <Box height={height} width={width} className={panel.styles.border == "None" ? "hover-bordered" : null} border={`1px solid transparent`} position="relative">
        <PanelHeader panel={panel} data={panelData} queryError={queryError} onCopyPanel={onCopyPanel} onRemovePanel={onRemovePanel} />
        {panelData && <Box
            // panel={panel}
            height={panelInnerHeight}
            overflowY="scroll"
            marginLeft={panel.type == PanelType.Graph ? "-10px" : "0px"}
        >
            <CustomPanelRender dashboardId={dashboard.id} panel={panel} data={panelData} height={panelInnerHeight} width={panelInnerWidth} sync={sync} />
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
}

const CustomPanelRender = memo((props: any) => {
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

    const title = replaceWithVariables(panel.title)
    const { isOpen, onOpen, onClose } = useDisclosure()

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
                            <Center width="100%">{!isEmpty(title) ? <Box cursor="pointer" className="hover-bordered" paddingTop={panel.styles.title.paddingTop} paddingBottom={panel.styles.title.paddingBottom} paddingLeft={panel.styles.title.paddingLeft} paddingRight={panel.styles.title.paddingRight} width="100%" fontSize={panel.styles.title.fontSize} fontWeight={panel.styles.title.fontWeight} color={panel.styles.title.color}><TitleDecoration styles={panel.styles}><Text noOfLines={1}>{title}</Text></TitleDecoration></Box> : <Box width="100px">&nbsp;</Box>}</Center>
                        </MenuButton>
                        <MenuList p="1">
                            <MenuItem icon={<FaEdit />} onClick={() => addParamToUrl({ edit: panel.id })}>Edit</MenuItem>
                            <MenuDivider my="1" />
                            <MenuItem icon={<FaRegCopy />} onClick={() => onCopyPanel(panel)}>Copy</MenuItem>
                            <MenuDivider my="1" />
                            <MenuItem icon={<FaBug />} onClick={onOpen}>Debug Panel</MenuItem>
                            <MenuDivider my="1" />
                            <MenuItem icon={<FaTrashAlt />} onClick={() => onRemovePanel(panel)}>Remove</MenuItem>
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

const formatQueryId = (datasourceId, dashboardId, panelId, queryId) => {
    return `${datasourceId}-${dashboardId}-${panelId}-${queryId}`
}