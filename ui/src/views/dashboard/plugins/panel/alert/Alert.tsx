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
import { Box, Center, Flex, StackDivider, Text, VStack } from "@chakra-ui/react"
import { DatasourceType, PanelProps } from "types/dashboard"
import { Log } from "types/plugins/log";
import { FaFilter } from "react-icons/fa";
import storage from "utils/localStorage";
import { cloneDeep, remove, sortBy } from "lodash";
import { isEmpty } from "utils/validate";
import LogChart from "../log/components/Chart";
import AlertToolbar from "./components/AlertToolbar";
import { AlertGroup, AlertRule, AlertToolbarOptions } from "types/plugins/alert";
import AlertRuleItem from "./components/AlertRuleItem";
import { jsonToEqualPairs } from "utils/format";




interface AlertPanelProps extends PanelProps {
    data: { "groups": AlertGroup[], "fromDs": DatasourceType }[]
}


const ToolbarStorageKey = "alert-toolbar-"
const AlertViewOptionsStorageKey = "alert-view-"
const AlertPanel = (props: AlertPanelProps) => {
    const { dashboardId, panel } = props
    const options = panel.plugins.alert
    const storageKey = ToolbarStorageKey + dashboardId + panel.id
    const viewStorageKey = AlertViewOptionsStorageKey + dashboardId + panel.id
    const [toolbarOpen, setToolbarOpen] = useState(storage.get(storageKey) ?? false)
    const [collaseAll, setCollapeAll] = useState(false)
    const [search, setSearch] = useState("")
    const [active, setActive] = useState<string[]>([])
    const [activeOp, setActiveOp] = useState<"or" | "and">("or")
    const [viewOptions, setViewOptions] = useState<AlertToolbarOptions>(storage.get(viewStorageKey) ?? {
        maxBars: 20,
        barType: "labels",
    })


    const [data] = useMemo(() => {
        const data: AlertRule[] = []
        const data0 = props.data.flat()
        for (const d of data0) {
            for (const group of d.groups) {
                for (const rule of group.rules) {
                    const r = cloneDeep(rule)
                    r.fromDs = d.fromDs
                    r.groupName = group.name
                    r.groupNamespace = group.file

                    data.push(r)
                    const ruleLabelKeys = Object.keys(r.labels)
                    for (const alert of r.alerts) {
                        delete alert.labels.alertname
                        for (const k of ruleLabelKeys) {
                            if (alert.labels[k] == r.labels[k]) {
                                delete alert.labels[k]
                            }
                        }
                        alert.name  = jsonToEqualPairs({ rule: r.name,...alert.labels })
                    }
                }
            }
        }


        return [data]
    }, [props.data])

    console.log("here333333:", data)
    useEffect(() => {
        if (!options.toolbar.show) {
            storage.remove(storageKey)
        }
    }, [options.toolbar.show])

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

    const onViewOptionsChange = useCallback((v) => {
        setViewOptions(v)
        storage.set(viewStorageKey, v)
    }, [])

    const onSelectLabel = useCallback(id => {
        setActive(active => {
            if (active.includes(id)) {
                return []
            } else {
                return [id]
            }
        })
    }, [])

    const [filterData,chartData] =  useMemo(() => {
        console.log("here33333:",active)
        let result = []
        const chartData = []
        if (active.length == 0) {
            result = data 
        }  else {
            for (const r0 of data) {
                const r = cloneDeep(r0)
                const  alerts = []
                for (const alert of r.alerts) {
                    if (active.includes(alert.name)) {
                        alerts.push(alert)
                    }
                }
                r.alerts = alerts 
                if (r.alerts.length > 0) {
                    result.push(r)
                }
            }
        }
        
        for (const r of result) {
            for (const alert of r.alerts) {
                chartData.push({
                    labels:  alert.name,
                    timestamp: new Date(alert.activeAt).getTime() * 1e6
                })
            }
        }

        return [result, sortBy(chartData, ['timestamp'])]
    }, [data, search, active])

    const sortedData: AlertRule[] = useMemo(() => {
        if (panel.plugins.alert.orderBy == "newest") {
            return sortBy(filterData, ['timestamp']).reverse()
        }

        return sortBy(filterData, ['timestamp'])
    }, [filterData, options.orderBy])

    return (<>
        <Flex position="relative">
            {options.toolbar.show &&
                <Box position="absolute" right="2" top="0" onClick={onToobarOpen} fontSize="0.7rem" opacity="0.6" cursor="pointer" px="2px" className={toolbarOpen ? "color-text" : null} py="2" zIndex={1}>
                    <FaFilter />
                </Box>}
            <Box height={props.height} width={props.width - (toolbarOpen ? options.toolbar.width : 1)} transition="all 0.3s">
                {options.chart.show && chartData.length != 0 && <Box className="alert-panel-chart" height={options.chart.height}>
                    <LogChart data={chartData} panel={panel} width={props.width - (toolbarOpen ? options.toolbar.width : 1)} viewOptions={viewOptions} onSelectLabel={onSelectLabel} activeLabels={active} />
                </Box>}
                <VStack alignItems="left" divider={<StackDivider />} mt="1">
                    {
                        sortedData.map(rule => <AlertRuleItem rule={rule} panel={panel} collapsed={collaseAll}  onSelectLabel={onSelectLabel} />)
                    }
                </VStack>
            </Box>
            {<Box className="bordered-left" width={toolbarOpen ? options.toolbar.width : 0} transition="all 0.3s" py="2">
                {toolbarOpen &&  <AlertToolbar active={active} labels={[]} panel={panel} onCollapseAll={onCollapseAll} onSearchChange={onSearchChange} height={props.height} onActiveLabel={onActiveLabel} currentCount={filterData.length} onViewLogChange={onViewOptionsChange} viewOptions={viewOptions} />}
            </Box>}
        </Flex>
    </>
    )
}

export default AlertPanel

