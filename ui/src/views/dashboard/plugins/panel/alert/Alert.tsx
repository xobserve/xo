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
import { Box, Center, Divider, Flex, StackDivider, Text, VStack, useColorMode } from "@chakra-ui/react"
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
import { equalPairsToJson, jsonToEqualPairs } from "utils/format";
import AlertStatView from "./components/AlertStatView";
import useBus from "use-bus";
import { AiOutlineSwitcher } from "react-icons/ai";
import { getTextColorForAlphaBackground, paletteColorNameToHex } from "utils/colors";




interface AlertPanelProps extends PanelProps {
    data: { "groups": AlertGroup[], "fromDs": DatasourceType }[]
}


const ToolbarStorageKey = "alert-toolbar-"
const AlertViewOptionsStorageKey = "alert-view-"
export const ResetPanelToolbalEvent = "reset-panel-toolbar"
export const ResetPanelToolbalViewModeEvent = "reset-panel-toolbar-view-mode"

const initViewOptions = () => ({
    maxBars: 20,
    barType: "labels",
    persist: false
})
const AlertPanel = (props: AlertPanelProps) => {
    const { dashboardId, panel,width, height } = props
    const { colorMode } = useColorMode()
    const options = panel.plugins.alert
    const storageKey = ToolbarStorageKey + dashboardId + panel.id
    const viewStorageKey = AlertViewOptionsStorageKey + dashboardId + panel.id
    const [toolbarOpen, setToolbarOpen] = useState(storage.get(storageKey) ?? false)
    const [collaseAll, setCollapeAll] = useState(true)
    const [search, setSearch] = useState("")
    const [active, setActive] = useState<string[]>([])
    const [viewOptions, setViewOptions] = useState<AlertToolbarOptions>(storage.get(viewStorageKey) ?? initViewOptions())

    useBus(
        ResetPanelToolbalEvent + panel.id,
        () => {
            onViewOptionsChange(initViewOptions() as any)
        },
    )

    useBus(
        ResetPanelToolbalViewModeEvent + panel.id,
        () => {
            delete viewOptions.viewMode
            onViewOptionsChange({ ...viewOptions })
        },
    )

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
                        alert.name = r.name + jsonToEqualPairs({ ...alert.labels })
                    }
                }
            }
        }


        return [data]
    }, [props.data, options.filter.datasources])

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

    const onViewOptionsChange = useCallback((v: AlertToolbarOptions) => {
        setViewOptions(v)
        if (v.persist) {
            storage.set(viewStorageKey, v)
        } else {
            storage.remove(viewStorageKey)
        }
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

    const [filterData, chartData] = useMemo(() => {
        let result = []
        const chartData = []

        const stateFilter = !isEmpty(viewOptions.stateFilter) ? viewOptions.stateFilter : options.filter.state
        for (const r0 of data) {
            // filter by rule state
            if (!stateFilter.includes(r0.state)) {
                continue
            }
            // filter by rule name
            const ruleFilter = !isEmpty(viewOptions.ruleNameFilter) ? viewOptions.ruleNameFilter : options.filter.ruleName
            if (!isEmpty(ruleFilter)) {
                const ruleFilters = ruleFilter.split(",")
                let pass = false
                for (const ruleFilter of ruleFilters) {
                    const filter = ruleFilter.trim().toLowerCase()
                    if (!isEmpty(filter) && r0.name.toLowerCase().match(filter)) {
                        pass = true
                        break
                    }
                }
                if (!pass) {
                    continue
                }
            }

            // fitler by rule label
            const labelFilter0 = !isEmpty(viewOptions.ruleLabelsFilter) ? viewOptions.ruleLabelsFilter : options.filter.ruleLabel
            const labelFilter = equalPairsToJson(labelFilter0)
            if (labelFilter) {
                let matches = true
                for (const k in labelFilter) {
                    if (!r0.labels[k].toLowerCase().match(labelFilter[k].toLowerCase())) {
                        matches = false
                        break
                    }
                }

                if (!matches) continue
            }

            const r = {
                ...r0,
                alerts: []
            }
            for (const alert of r0.alerts) {
                // filter by alert state
                if (!stateFilter.includes(alert.state)) {
                    continue
                }

                // filter by active labels
                if (active.length != 0 && !active.includes(alert.name)) {
                    continue
                }

                // filter by alert label
                const labelFilter1 = !isEmpty(viewOptions.labelNameFilter) ? viewOptions.labelNameFilter : options.filter.alertLabel
                const labelFilter = equalPairsToJson(labelFilter1)
                if (labelFilter) {
                    let matches = true
                    for (const k in labelFilter) {
                        if (!alert.labels[k].toLowerCase().match(labelFilter[k].toLowerCase())) {

                            matches = false
                            break
                        }
                    }

                    if (!matches) continue
                }

                r.alerts.push(alert)
            }

            if (r.alerts.length > 0) {
                result.push(r)
            }
        }



        for (const r of result) {
            for (const alert of r.alerts) {
                chartData.push({
                    labels: alert.name,
                    timestamp: new Date(alert.activeAt).getTime() * 1e6
                })
            }
        }

        return [result, sortBy(chartData, ['timestamp'])]
    }, [data, search, active, options.filter, viewOptions.stateFilter, viewOptions.ruleNameFilter, viewOptions.ruleLabelsFilter, viewOptions.labelNameFilter])

    const sortedData: AlertRule[] = useMemo(() => {
        if (panel.plugins.alert.orderBy == "newest") {
            return sortBy(filterData, ['timestamp']).reverse()
        }

        return sortBy(filterData, ['timestamp'])
    }, [filterData, options.orderBy])

    const showChart = options.chart.show && chartData.length != 0 && (width > 400 && height > 300)
    const viewMode = viewOptions.viewMode ?? options.viewMode
    const alertsCount = filterData.reduce((acc, r) => acc + r.alerts.length, 0)

    return (<Box height={height} width={width} position="relative">
        {
            viewMode == "list" && <Flex position="relative">
                    {options.toolbar.show && width > 400 &&
                        <Box position="absolute" right="2" top={toolbarOpen ? 2 : 0} onClick={onToobarOpen} fontSize="0.7rem" opacity={width < 400 ? 0 : 0.3} _hover={{opacity: 0.3}} cursor="pointer" px="2px" className={toolbarOpen ? "color-text" : null} py="2" zIndex={1}>
                            <FaFilter />
                        </Box>}
                    <Box height={props.height} width={width > 400 ? props.width - (toolbarOpen ? options.toolbar.width : 1) : width} transition="all 0.3s">
                        {showChart && <Box className="alert-panel-chart" height={options.chart.height}>
                            <LogChart data={chartData} panel={panel} width={props.width - (toolbarOpen ? options.toolbar.width : 1)} viewOptions={viewOptions} onSelectLabel={onSelectLabel} activeLabels={active} />
                            <Divider mt="3" />
                        </Box>}
                        <VStack alignItems="left" divider={<StackDivider />} mt={showChart ? 3 : 1} spacing={1}>
                            {
                                sortedData.map(rule => <AlertRuleItem rule={rule} panel={panel} collapsed={collaseAll} onSelectLabel={onSelectLabel} width={width} />)
                            }
                        </VStack>
                    </Box>
                    { width > 400 &&  <Box className={toolbarOpen ? "bordered-left" : null} width={toolbarOpen ? options.toolbar.width : 0} transition="all 0.3s" py="2">
                        {toolbarOpen  && <AlertToolbar active={active} labels={[]} panel={panel} onCollapseAll={onCollapseAll} onSearchChange={onSearchChange} height={props.height} onActiveLabel={onActiveLabel} rulesCount={filterData.length} alertsCount={alertsCount} onViewLogChange={onViewOptionsChange} viewOptions={viewOptions} />}
                    </Box>}
                </Flex>
            
        }
        {
            viewMode == "stat" &&     <Box className="alert-stat-view" height={props.height} width={props.width}>
                    <AlertStatView   {...props} data={filterData} />
                   
                </Box>
        }
        {(viewMode == "stat" || width < 400) && <Box position="absolute" right="2" top="1" opacity={width < 400 ? 0 : 1}  _hover={{opacity: 1}} color={viewMode == "stat" ? getTextColorForAlphaBackground(paletteColorNameToHex(options.stat.color), colorMode == "dark") : "inherit"} cursor="pointer" onClick={() => onViewOptionsChange({ ...viewOptions, viewMode: viewOptions.viewMode == "list" ? "stat" : "list" })} pb="2"><AiOutlineSwitcher /></Box>}
    </Box>
    )
}

export default AlertPanel

