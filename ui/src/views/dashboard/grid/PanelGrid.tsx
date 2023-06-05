import { Dashboard, DatasourceType, Panel, PanelType } from "types/dashboard"
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, Center, HStack, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, Tooltip, useColorModeValue, useToast } from "@chakra-ui/react";
import { FaBook, FaCopy, FaEdit, FaRegCopy, FaTrashAlt } from "react-icons/fa";
import { IoMdInformation } from "react-icons/io";
import TextPanel from "../plugins/panel/text/Text";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { run_prometheus_query } from "../plugins/datasource/prometheus/query_runner";
import { DataFrame } from "types/dataFrame";
import GraphPanel from "../plugins/panel/graph/Graph";
import { PANEL_BODY_PADDING, PANEL_HEADER_HEIGHT, StorageCopiedPanelKey } from "src/data/constants";
import { cloneDeep, isEmpty, isEqual } from "lodash";
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


interface PanelGridProps {
    dashboard: Dashboard
    panel: Panel
    onRemovePanel?: any
    variables: Variable[]
    sync: any
    onVariablesChange?: any
}

const PanelGrid = (props: PanelGridProps) => {
    console.log("panel grid rendered")
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
export const PanelComponent = ({ dashboard, panel, onRemovePanel, width, height, sync,timeRange,variables }: PanelComponentProps) => {
    const toast = useToast()
    const [panelData, setPanelData] = useState<DataFrame[]>(null)
    const [queryError, setQueryError] = useState()

    useEffect(() => {
        queryData(dashboard.id + panel.id)
    },[panel.datasource,timeRange,variables])

    const queryData = async (queryId) => {
        for (var i = 0; i < panel.datasource.length; i++) {
            const ds = panel.datasource[i]
            if (ds.selected) {
                let data = []
                let needUpdate = false
                for (const q0 of ds.queries) {
                    const metrics = replaceWithVariables(q0.metrics, variables)
                    const q = { ...q0, metrics }

                    const id = queryId + q.id
                    const prevQuery = prevQueries[id]
                    const currentQuery = [q, timeRange]

                    if (isEqual(prevQuery, currentQuery)) {
                        const d = prevQueryData[id]
                        if (d) {
                            data.push(...d)
                        }
                        continue
                    }

                    needUpdate = true
                    // console.log("re-query data! metrics id:", q.id, " query id:", queryId)

                    prevQueries[id] = currentQuery
                    let res
                    switch (ds.type) {
                        case DatasourceType.Prometheus:


                            res = await run_prometheus_query(q, timeRange)
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
                        data.push(...res.data)
                        prevQueryData[id] = res.data
                    }
                }

               
                
                if (needUpdate) {
                    console.log("query and set panel data")
                    setPanelData(data)
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


    const r = useRef(null)
    console.log("panel component rendered, data: ",panelData)
    return <Box height="100%" >
        <PanelHeader panel={panel} queryError={queryError} onCopyPanel={onCopyPanel} onRemovePanel={onRemovePanel}/>
        {panelData && <Box
            // panel={panel}
            maxHeight={`${isEmpty(panel.title) ? height : panelBodyHeight}px`}
            overflowY="scroll"
            marginLeft={panel.type == PanelType.Graph ? "-10px" : "0px"}
            h="100%"
        >
            {
                isEmpty(panelData) ?
                    <Box h="100%">
                        <Center height="100%">No data</Center></Box>
                    : <CustomPanelRender panel={panel} data={panelData} height={panelInnerHeight} width={panelInnerWidth} sync={sync}  />
            }
        </Box>}
    </Box>
}


const CustomPanelRender = memo((props:any) => {
    //@needs-update-when-add-new-panel
    switch (props.panel?.type) {
        case PanelType.Text:
            return <TextPanel  {...props} />
        case PanelType.Graph:
            return <GraphPanel {...props} />
        case PanelType.Table:
            return <TablePanel {...props} />
        default:
            return <></>
    }
})

const PanelHeader = ({queryError,panel,onCopyPanel,onRemovePanel}) => {
    const router = useRouter()

    const title = replaceWithVariables(panel.title, variables)
    
    return (
        <HStack className="grid-drag-handle"  height={`${PANEL_HEADER_HEIGHT - (isEmpty(title) ? 15 : 0)}px`} cursor="move" spacing="0" position={isEmpty(title) ? "absolute" : "relative"} width="100%" zIndex={1000}>
            {(queryError || panel.desc) && <Box color={useColorModeValue(queryError ? "red" : "brand.500", queryError ? "red" : "brand.200")} position="absolute">
                <Tooltip label={queryError ?? replaceWithVariables(panel.desc, variables)}>
                    <Box>
                        <IoMdInformation fontSize="20px" cursor="pointer" />
                    </Box>
                </Tooltip>
            </Box>}
            <Center width="100%">
                {!router.query.edit ? <Menu placement="bottom">
                    <MenuButton
                        transition='all 0.2s'
                        _focus={{ border: null }}
                        onClick={e => e.stopPropagation()} 
                    >
                        <Center width="100%">{!isEmpty(title) ? <Box cursor="pointer">{title}</Box> : <Box width="100px">&nbsp;</Box>}</Center>
                    </MenuButton>
                    <MenuList p="1">
                        <MenuItem icon={<FaEdit />} onClick={() => addParamToUrl({edit: panel.id})}>Edit</MenuItem>
                        <MenuDivider my="1" />
                        <MenuItem icon={<FaRegCopy />} onClick={() => onCopyPanel(panel)}>Copy</MenuItem>
                        <MenuDivider my="1" />
                        <MenuItem icon={<FaTrashAlt />} onClick={() => onRemovePanel(panel)}>Remove</MenuItem>
                    </MenuList>
                </Menu> :
                    <Text cursor="pointer" width="fit-content">{title}</Text>
                }
            </Center>
            <Box display="none"><FaBook className="grid-drag-handle"/></Box>
        </HStack>
    )
}