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
import { LogSeries ,Log} from "types/plugins/log";
import { FaFilter } from "react-icons/fa";
import LogToolbar from "./components/Toolbar";
import storage from "utils/localStorage";
import LogItem from "./components/LogItem";




interface LogPanelProps extends PanelProps {
    data: LogSeries[][]
}



const ToolbarStorageKey = "toolbar-"
const LogPanel = (props: LogPanelProps) => {
    const { dashboardId, panel } = props
    const storageKey = ToolbarStorageKey + dashboardId + panel.id
    const [toolbarOpen, setToolbarOpen] = useState(storage.get(storageKey)??false)
    const [collaseAll, setCollapeAll] = useState(true)
    const [search, setSearch] = useState("")
    const data: LogSeries[] = props.data.flat()
    if (data.length === 0) {
        return
    }
    console.log("here333333", data)

    useEffect(() => {
        if (!panel.plugins.log.toolbar.show) {
            storage.remove(storageKey)
        }
    },[panel.plugins.log.toolbar.show])

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
    },[])

    const onSearchChange = useCallback((v:string) => {
        setSearch(v.toLowerCase().trim())
    },[])

    const filterData: Log[] =  useMemo(() => {
        const result: Log[] = []
        for (const series of data) {
            const labels = series.labels
            for (const v of series.values) {
                const timestamp = v[0]
                const content = v[1]
                const lowerContent = content.toLowerCase()
                if (search == "") {
                    result.push({labels, timestamp, content, highlight: null})
                } else {
                    const isOr = search.includes("||")
                    const isAnd = search.includes("&&")
                    if (!isOr && !isAnd) {
                        if (lowerContent.includes(search)) {
                            result.push({labels, timestamp, content, highlight: [search]})
                        }
                    } else {
                        if (isOr) {
                            const searches = search.split("||") 
                            for (const s of searches) {
                                const s1 = s.trim()
                                if (lowerContent.includes(s1)) {
                                    result.push({labels, timestamp, content, highlight: [s1]})
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
                                result.push({labels, timestamp, content, highlight: searches})
                            }
                        }
                    }
                }
            }
        }
        return result
    },[data, search])
    
    return (<Flex position="relative">
        {panel.plugins.log.toolbar.show &&
            <Box position="absolute" right="2" top="0" onClick={onToobarOpen} fontSize="0.7rem" opacity="0.6" cursor="pointer" p="2px" className="color-text">
                <FaFilter />
            </Box>}
        <VStack alignItems="left" divider={<StackDivider />} py="2" width={props.width - (toolbarOpen ? panel.plugins.log.toolbar.width : 1)} transition="all 0.3s">
            {
                filterData.map(log => <LogItem log={log} panel={panel} collapsed={collaseAll} />)
            }
        </VStack>
        {<Box className="bordered-left" width={toolbarOpen ? panel.plugins.log.toolbar.width : 0} transition="all 0.3s">
            <LogToolbar data={data} panel={panel} onCollapseAll={onCollapseAll} onSearchChange={onSearchChange}/>
        </Box>}
    </Flex>)
}

export default LogPanel


