import { Dashboard, DatasourceType, Panel, PanelType } from "types/dashboard"
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, Center, HStack, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, Tooltip, useColorModeValue, useDisclosure, useToast } from "@chakra-ui/react";
import { FaBook, FaCopy, FaEdit, FaRegCopy, FaTrashAlt } from "react-icons/fa";
import { IoMdInformation } from "react-icons/io";
import TextPanel from "../plugins/panel/text/Text";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { run_prometheus_query } from "../plugins/datasource/prometheus/query_runner";
import { DataFrame } from "types/dataFrame";
import GraphPanel from "../plugins/panel/graph/Graph";
import { PANEL_BODY_PADDING, PANEL_HEADER_HEIGHT, StorageCopiedPanelKey } from "src/data/constants";
import { cloneDeep, isArray, isEmpty, isEqual } from "lodash";
import { TimeRange } from "types/time";
import { Variable } from "types/variable";
import { replaceWithVariables } from "utils/variable";
import storage from "utils/localStorage";
import TablePanel from "../plugins/panel/table/Table";
import useBus from 'use-bus'
import { getInitTimeRange } from "components/TimePicker";
import { TimeChangedEvent, VariableChangedEvent } from "src/data/bus-events";
import { variables } from "../Dashboard";
import { useRouter } from "next/router";
import { addParamToUrl } from "utils/url";
import { run_testdata_query } from "../plugins/datasource/testdata/query_runner";
import { run_jaeger_query } from "../plugins/datasource/jaeger/query_runner";
import NodeGraphPanel from "../plugins/panel/nodeGraph/NodeGraph";
import { Portal } from "components/portal/Portal";


interface PanelGridProps {
    dashboard: Dashboard
    panel: Panel
    onRemovePanel?: any
    sync: any
    onVariablesChange?: any
}

const PanelGrid = (props: PanelGridProps) => {
    console.log("panel grid rendered:", props.panel.id)
    return (<AutoSizer>
        {({ width, height }) => {
            if (width === 0) {
                return null;
            }

            return (
                <Box width={width}
                    height={height}>
                    <PanelEventWrapper width={width} height={height} {...props} />
                </Box>
            );
        }}
    </AutoSizer>)
}

export default PanelGrid


export const PanelEventWrapper = (props) => {
    const [tr, setTr] = useState<TimeRange>(getInitTimeRange())
    useBus(
        (e) => { return e.type == TimeChangedEvent },
        (e) => {
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

    return (
        <PanelComponent {...props} timeRange={tr} variables={variables1} />
    )
}
interface PanelComponentProps extends PanelGridProps {
    width: number
    height: number
    timeRange: TimeRange
    variables: Variable[]
}

export const prevQueries = {}
export const prevQueryData = {}
export const PanelComponent = ({ dashboard, panel, onRemovePanel, width, height, sync, timeRange, variables }: PanelComponentProps) => {
    const toast = useToast()
    const [panelData, setPanelData] = useState<DataFrame[]>(null)
    const [queryError, setQueryError] = useState()

    // useEffect(() => console.log("panel created:", panel.id), [])
    useEffect(() => {
        queryData(panel, dashboard.id + panel.id)
    }, [panel.datasource, timeRange, variables])

    const queryData = async (panel, queryId) => {
        for (var i = 0; i < panel.datasource.length; i++) {
            const ds = panel.datasource[i]
            if (ds.selected) {
                let data = []
                let needUpdate = false
                for (const q0 of ds.queries) {
                    console.log(q0)
                    const metrics = replaceWithVariables(q0.metrics, variables)
                    const q = { ...q0, metrics }
                    console.log(q)
                    const id = queryId + q.id
                    const prevQuery = prevQueries[id]
                    const currentQuery = [q, timeRange]

                    if (isEqual(prevQuery, currentQuery)) {
                        const d = prevQueryData[id]
                        if (d) {
                            if (isArray(d)) {
                                data.push(...d)
                            } else {
                                data.push(d)
                            }
                        }
                        continue
                    }

                    needUpdate = true
                    // console.log("re-query data! metrics id:", q.id, " query id:", queryId)

                    prevQueries[id] = currentQuery
                    let res
                    //@needs-update-when-add-new-datasource
                    switch (ds.type) {
                        case DatasourceType.Prometheus:
                            res = await run_prometheus_query(panel, q, timeRange)
                            break;
                        case DatasourceType.TestData:
                            res = await run_testdata_query(panel, q, timeRange)
                            break;
                        case DatasourceType.Jaeger:
                            res = await run_jaeger_query(panel, q, timeRange)
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
                        if (isArray(res.data)) {
                            data.push(...res.data)
                        } else {
                            data.push(res.data)
                        }

                        prevQueryData[id] = res.data
                    }
                }



                if (needUpdate) {
                    console.log("query and set panel data:", panel.id)
                    setPanelData(data)
                } else {
                    if (panelData?.length != data.length) {
                        setPanelData(data)
                    }
                }
            }
        }
    }

    const onCopyPanel = (panel) => {
        toast({
            title: "Copied",
            description: "Panel copied, you can use it through **Add Panel** button",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        storage.set(StorageCopiedPanelKey, panel)
    }

    const panelBodyHeight = height - PANEL_HEADER_HEIGHT
    const panelInnerHeight = panelBodyHeight - PANEL_BODY_PADDING * 2 // 10px padding top and bottom of panel body
    const panelInnerWidth = width + 8 // 10px padding left and right of panel body


    console.log("panel component rendered, data: ", panelData, panel)
    return <Box height="100%" className="hover-bordered">
        <PanelHeader panel={panel} data={panelData} queryError={queryError} onCopyPanel={onCopyPanel} onRemovePanel={onRemovePanel} />
        {panelData && <Box
            // panel={panel}
            maxHeight={`${isEmpty(panel.title) ? height : panelBodyHeight}px`}
            overflowY="scroll"
            marginLeft={panel.type == PanelType.Graph ? "-10px" : "0px"}
            h="100%"
        >
            {
                isEmpty(panelData) && panel.useDatasource ?
                    <Box h="100%">
                        <Center height="100%">No data</Center></Box>
                    : <CustomPanelRender dashboardId={dashboard.id} panel={panel} data={panelData} height={panelInnerHeight} width={panelInnerWidth} sync={sync} />
            }
        </Box>}
    </Box>
}


const CustomPanelRender = memo((props: any) => {
    //@needs-update-when-add-new-panel
    switch (props.panel?.type) {
        case PanelType.Text:
            return <TextPanel  {...props} />
        case PanelType.Graph:
            return <GraphPanel {...props} />
        case PanelType.Table:
            return <TablePanel {...props} />
        case PanelType.NodeGraph:
            return <NodeGraphPanel {...props} />
        default:
            return <></>
    }
})

const PanelHeader = ({ queryError, panel, onCopyPanel, onRemovePanel,data }) => {
    const router = useRouter()

    const title = replaceWithVariables(panel.title, variables)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [debug, setDebug] = useState(false)

    return (
        <>
            <HStack className="grid-drag-handle hover-bg" height={`${PANEL_HEADER_HEIGHT - (isEmpty(title) ? 15 : 0)}px`} cursor="move" spacing="0" position={isEmpty(title) ? "absolute" : "relative"} width="100%" zIndex={1000}>
                {(queryError || panel.desc) && <Box color={useColorModeValue(queryError ? "red" : "brand.500", queryError ? "red" : "brand.200")} position="absolute">
                    <Tooltip label={queryError ?? replaceWithVariables(panel.desc, variables)}>
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
                            <Center width="100%">{!isEmpty(title) ? <Box cursor="pointer" className="hover-bordered">{title}</Box> : <Box width="100px">&nbsp;</Box>}</Center>
                        </MenuButton>
                        <Portal>
                            <MenuList p="1">
                                <MenuItem icon={<FaEdit />} onClick={() => addParamToUrl({ edit: panel.id })}>Edit</MenuItem>
                                <MenuDivider my="1" />
                                <MenuItem icon={<FaRegCopy />} onClick={() => onCopyPanel(panel)}>Copy</MenuItem>
                                <MenuDivider my="1" />
                                <MenuItem icon={<FaTrashAlt />} onClick={() => onRemovePanel(panel)}>Remove</MenuItem>
                                <MenuDivider my="1" />
                                <MenuItem icon={<FaTrashAlt />} onClick={onOpen}>Debug Panel</MenuItem>

                            </MenuList>
                        </Portal>
                    </Menu>
                </Center>
                <Box display="none"><FaBook className="grid-drag-handle" /></Box>
            </HStack>
            {isOpen && <DebugPanel panel={panel} isOpen={isOpen} onClose={onClose} data={data} />}
        </>
    )
}

const DebugPanel = ({ panel, isOpen, onClose,data }) => {
    const [tabIndex, setTabIndex] = useState(0)


    return (<Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth="600px">
            <ModalCloseButton />
            <ModalBody>
            <Tabs onChange={(index) => setTabIndex(index)} >
                    <TabList>
                        <Tab>Panel JSON</Tab>
                        <Tab>Panel Data</Tab>
                    </TabList>
                    <TabPanels p="1">
                        <TabPanel>
                            <Textarea  minH="500px">
                                {JSON.stringify(panel,null,2)}
                            </Textarea>
                        </TabPanel>
                        <TabPanel>
                            <Textarea  minH="500px">
                                {JSON.stringify(data,null,2)}
                            </Textarea>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ModalBody>
        </ModalContent>
    </Modal>
    )
}