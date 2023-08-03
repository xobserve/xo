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

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Flex, StackDivider, VStack } from "@chakra-ui/react"
import { PanelProps } from "types/dashboard"
import { LogSeries, Log, LogLabel } from "types/plugins/log";
import { FaFilter } from "react-icons/fa";
import LogToolbar from "./components/Toolbar";
import storage from "utils/localStorage";
import LogItem from "./components/LogItem";
import { formatLabelId } from "./utils";
import { cloneDeep, remove, sortBy } from "lodash";
import LogChart from "./components/Chart";




interface LogPanelProps extends PanelProps {
    data: LogSeries[][]
}



const ToolbarStorageKey = "toolbar-"
const LogPanel = (props: LogPanelProps) => {
    const { dashboardId, panel } = props
    const storageKey = ToolbarStorageKey + dashboardId + panel.id
    const [toolbarOpen, setToolbarOpen] = useState(storage.get(storageKey) ?? false)
    const [collaseAll, setCollapeAll] = useState(true)
    const [search, setSearch] = useState("")
    const [active, setActive] = useState<string[]>([])
    const [activeOp, setActiveOp] = useState<"or" | "and">("or")
    const data: LogSeries[] = props.data.flat()
    if (data.length === 0) {
        return
    }

    const labels = useMemo(() => {
        const result: LogLabel[] = []
        for (const series of data) {
            const ls = series.labels
            const count = series.values.length
            for (const k of Object.keys(ls)) {
                const l = result.find(r => r.name == k && r.value == ls[k])
                if (!l) {
                    result.push({ id: formatLabelId(k, ls[k]), name: k, value: ls[k], count: count })
                } else {
                    l.count += count
                }
            }
        }
        return result
    }, [data])

    console.log("here333333", data)

    useEffect(() => {
        if (!panel.plugins.log.toolbar.show) {
            storage.remove(storageKey)
        }
    }, [panel.plugins.log.toolbar.show])

    const onToobarOpen = () => {
        if (!toolbarOpen) {
            storage.set(storageKey, true)
        } else {
            storage.remove(storageKey)
        }

        setToolbarOpen(!toolbarOpen)

    }

    const onCollapseAll = useCallback(v => {
        setCollapeAll(v)
    }, [])

    const onSearchChange = useCallback((v: string) => {
        setSearch(v.toLowerCase().trim())
    }, [])

    const onActiveLabel = useCallback((id) => {
        if (active.includes(id)) {
            remove(active, i => id == i)
        } else {
            active.push(id)
        }

        setActive(cloneDeep(active))
    }, [active])

    const onActiveOpChange = useCallback(() => {
        setActiveOp(activeOp == "or" ? "and" : "or")
    }, [])

    const filterData: Log[] = useMemo(() => {
        const result: Log[] = []
        for (const series of data) {
            const labels = series.labels
            if (active.length > 0) {
                let isActive = false
                if (activeOp == "or") {
                    for (const k of Object.keys(labels)) {
                        if (active.find(id => id == formatLabelId(k, labels[k]))) {
                            isActive = true
                        }
                    }
                } else {
                    let found = true
                    const labelArray = []
                    for (const k of Object.keys(labels)) {
                        labelArray.push({ name: k, value: labels[k] })
                    }
                    for (const a of active) {
                        if (!labelArray.find(l => a == formatLabelId(l.name, l.value))) {
                            found = false
                            break
                        }
                    }
                    isActive = found
                }

                if (!isActive) continue
            }
            for (const v of series.values) {
                const timestamp = v[0]
                const content = v[1]
                const lowerContent = content.toLowerCase()
                if (search == "") {
                    result.push({ labels, timestamp, content, highlight: null })
                } else {
                    const isOr = search.includes("||")
                    const isAnd = search.includes("&&")
                    if (!isOr && !isAnd) {
                        if (lowerContent.includes(search)) {
                            result.push({ labels, timestamp, content, highlight: [search] })
                        }
                    } else {
                        if (isOr) {
                            const searches = search.split("||")
                            for (const s of searches) {
                                const s1 = s.trim()
                                if (lowerContent.includes(s1)) {
                                    result.push({ labels, timestamp, content, highlight: [s1] })
                                    break
                                }
                            }
                        } else if (isAnd) {
                            const searches = search.split("&&")
                            let found = true
                            for (const s of searches) {
                                if (!lowerContent.includes(s.trim())) {
                                    found = false
                                    break
                                }
                            }
                            if (found) {
                                result.push({ labels, timestamp, content, highlight: searches })
                            }
                        }
                    }
                }
            }
        }

        return result
    }, [data, search, active])

    const sortedData = useMemo(() => {
        if (panel.plugins.log.orderBy == "newest") {
            return sortBy(filterData, ['timestamp']).reverse()
        }

        return sortBy(filterData, ['timestamp'])
    }, [filterData, panel.plugins.log.orderBy])

    return (<Flex position="relative">
        {panel.plugins.log.toolbar.show &&
            <Box position="absolute" right="2" top="0" onClick={onToobarOpen} fontSize="0.7rem" opacity="0.6" cursor="pointer" p="2px" className={toolbarOpen ? "color-text" : null}>
                <FaFilter />
            </Box>}
        <Box height={props.height} width={props.width - (toolbarOpen ? panel.plugins.log.toolbar.width : 1)} transition="all 0.3s" py="2">
            {panel.plugins.log.chart.show && <Box className="log-panel-chart" height={panel.plugins.log.chart.height}>
                <LogChart data={sortedData} panel={panel} width={props.width - (toolbarOpen ? panel.plugins.log.toolbar.width : 1)} />
            </Box>}
            <VStack alignItems="left" divider={<StackDivider />}  >
                {
                    sortedData.map(log => <LogItem log={log} panel={panel} collapsed={collaseAll} />)
                }
            </VStack>
        </Box>
        {<Box className="bordered-left" width={toolbarOpen ? panel.plugins.log.toolbar.width : 0} transition="all 0.3s">
            <LogToolbar active={active} labels={labels} panel={panel} onCollapseAll={onCollapseAll} onSearchChange={onSearchChange} height={props.height} onActiveLabel={onActiveLabel} activeOp={activeOp} onActiveOpChange={onActiveOpChange} currentLogsCount={filterData.length} />
        </Box>}
    </Flex>)
}

export default LogPanel


