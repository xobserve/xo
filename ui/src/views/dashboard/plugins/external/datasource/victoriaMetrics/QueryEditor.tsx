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
import { Box, HStack, Input, VStack, useMediaQuery, useToast, Switch, Button } from "@chakra-ui/react"
import { cloneDeep } from "lodash"
import { useEffect, useState } from "react"
import { PanelQuery } from "types/dashboard"
import React from "react";
import { Variant } from "chakra-react-select/dist/types/types"
import { DatasourceEditorProps } from "types/datasource"
import { queryDemoAllMetrics, queryDemoLabels } from "./query_runner"
import ChakraSelect from "src/components/select/ChakraSelect"
import FormItem from "src/components/form/Item"
import { Form } from "src/components/form/Form"
import InputSelect from "src/components/select/InputSelect"
import { prometheusDsMsg } from "src/i18n/locales/en";
import { useStore } from "@nanostores/react";
import CodeEditor, { LogqlLang } from "src/components/CodeEditor/CodeEditor";
import RadionButtons from "src/components/RadioButtons";
import { IsSmallScreen } from "src/data/constants";
import Loading from "components/loading/Loading";
import TraceQuery from "./TraceQuery/TraceQuery";
import useBus from "use-bus";
import { SeriesData } from "types/seriesData";
import { PanelDataEvent } from "src/data/bus-events";
import { useSearchParam } from "react-use";
import { $datasources } from "src/views/datasource/store";
import { requestApi } from "utils/axios/request";
import { isEmpty } from "utils/validate";
import { FaExternalLinkAlt } from "react-icons/fa";



const QueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const t1 = useStore(prometheusDsMsg)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const [isSmallScreen] = useMediaQuery(IsSmallScreen)
    const isLargeScreen = !isSmallScreen
    const [panelData, setPanelData] = useState<SeriesData[]>(null)
    const Stack = isLargeScreen ? HStack : VStack
    const edit = useSearchParam("edit")
    const [expandedMetrics, setExpandedMetrics] = useState<string>(null)
    const [expanded, setExpanded] = useState(false)
    useEffect(() => {
        const q = query?.metrics
        if (!isEmpty(q)) {
            // /prometheus/expand-with-exprs
            requestApi.get(`/proxy/${datasource.id}/prometheus/expand-with-exprs?query=${q}&format=json`).then((res: any) => {
                if (res?.status == "success") {
                    setExpandedMetrics(res.expr)
                }
            })
            return
        }
        setExpandedMetrics(null)
    }, [query?.metrics])
    useBus(
        (e) => { return e.type == PanelDataEvent + edit },
        (e) => {
            setPanelData(e.data?.flat())
        },
        [edit]
    )

    const queryData: any = panelData?.find(s => s.queryId == tempQuery.id)
    const queryStr = queryData?.fields.find(f => f.labels).labels["__name__"]

    const ds = $datasources.get().find(d => d.id == datasource.id)

    console.log("here33333:", isLargeScreen)
    return (
        <Form spacing={1}>
            <FormItem size="sm" title={<PromMetricSelect enableInput={false} width={isLargeScreen ? "300px" : "150px"} dsId={datasource.id} value={tempQuery.metrics} onChange={v => {
                setTempQuery({ ...tempQuery, metrics: v })
                onChange({ ...tempQuery, metrics: v })
            }} />} >
                <Stack width="100%" alignItems={isLargeScreen ? "center" : "end"}>
                    <Box width={isLargeScreen ? "calc(100% - 100px)" : "calc(100% - 5px)"}>
                        <CodeEditor
                            language={LogqlLang}
                            value={tempQuery.metrics}
                            onChange={(v) => {
                                setTempQuery({ ...tempQuery, metrics: v })
                            }}
                            onBlur={() => {
                                onChange(tempQuery)
                            }}
                            isSingleLine
                            placeholder={t1.enterPromQL}
                        // height="31px"
                        />
                        {expanded && <CodeEditor
                            language={LogqlLang}
                            value={expandedMetrics}
                            isSingleLine
                            placeholder={t1.enterPromQL}
                            readonly
                        />}
                    </Box>
                    <HStack spacing={1}>
                        <Button size="xs" variant="ghost" onClick={() => setExpanded(!expanded)}>{!expanded ? "Expand" : "Collapse"}</Button>
                        <Box onClick={() => window.open(`${ds.url}/vmui/#/expand-with-exprs?expr=${tempQuery.metrics}`)} textStyle="annotation" cursor="pointer" fontSize="0.7rem"><FaExternalLinkAlt /></Box>
                    </HStack>
                </Stack>
            </FormItem>
            <Stack alignItems={isLargeScreen ? "center" : "start"} spacing={isLargeScreen ? 4 : 1}>
                <FormItem labelWidth={"150px"} size="sm" title="Legend">
                    <Input
                        value={tempQuery.legend}
                        onChange={(e) => {
                            setTempQuery({ ...tempQuery, legend: e.currentTarget.value })
                        }}
                        onBlur={() => onChange(tempQuery)}
                        width="150px"
                        placeholder={t1.legendFormat}
                        size="sm"
                    />
                </FormItem>
                <FormItem labelWidth={"150px"} size="sm" title="Trace query" alignItems="center">
                    <Switch defaultChecked={tempQuery.data['traceQuery']} onChange={(e) => {
                        tempQuery.data['traceQuery'] = e.target.checked
                        const q = { ...tempQuery, data: cloneDeep(tempQuery.data) }
                        setTempQuery(q)
                        onChange(q)
                    }} />
                </FormItem>
                <FormItem labelWidth={"150px"} size="sm" title="View in vmui" alignItems="center" desc="Open vmui to view curren metrics" onLabelClick={() => window.open(`${ds.url}/vmui?g0.expr=${tempQuery.metrics}`)}>
                </FormItem>
                {/* {isLargeScreen && <ExpandTimeline t1={t1} tempQuery={tempQuery} setTempQuery={setTempQuery} onChange={onChange}/>} */}
            </Stack>

            {queryData?.trace && <TraceQuery data={queryData.trace} query={queryStr} />}
        </Form>
    )
}

export default QueryEditor

const md = `
#aaa
`
const ExpandTimeline = ({ t1, tempQuery, setTempQuery, onChange }) => {
    return <FormItem labelWidth="150px" size="sm" title={t1.expandTimeline} desc={t1.expandTimelineDesc}>
        <RadionButtons size="sm" options={[{ label: "Auto", value: "auto" }, { label: "Always", value: 'always' }, { label: "None", value: 'none' }]} value={tempQuery.data['expandTimeline']} onChange={(v) => {
            tempQuery.data['expandTimeline'] = v
            const q = { ...tempQuery, data: cloneDeep(tempQuery.data) }
            setTempQuery(q)
            onChange(q)
        }} />
    </FormItem>
}


interface MetricSelectProps {
    dsId: number
    value: string
    onChange: any
    width?: string
    variant?: Variant
    useCurrentTimerange?: boolean
    enableInput?: boolean
}

export const PromMetricSelect = ({ dsId, value, onChange, width = "200px", variant = "unstyled", useCurrentTimerange = true, enableInput = true }: MetricSelectProps) => {
    const t1 = useStore(prometheusDsMsg)
    const toast = useToast()
    const [metricsList, setMetricsList] = useState<string[]>([])
    const [loading, setLoading] = useState(false)



    const loadMetrics = async () => {
        if (metricsList.length > 0) {
            return
        }
        setLoading(true)
        const res = await queryDemoAllMetrics(dsId)
        setLoading(false)
        if (res.error) {
            toast({
                title: "Error",
                description: res.error,
                status: "error",
                duration: 9000,
                isClosable: true,
            })
            return
        }
        setMetricsList(res.data ?? [])
    }

    return (
        <Box onClick={loadMetrics} position="relative" width={width}>
            <InputSelect width={width} isClearable value={value} placeholder={t1.selecMetrics} variant={variant} size="md" options={metricsList.map((m) => { return { label: m, value: m } })} onChange={v => onChange(v)} enableInput={enableInput}
            />
            {loading && <Box position="absolute" right="50%" top="6px  "><Loading size="sm" /></Box>}
        </Box>

    )
}

interface LabelSelectProps {
    dsId: number
    metric?: string
    value: string
    onChange: any
    width?: string
    variant?: Variant
    useCurrentTimerange?: boolean
}

export const PromLabelSelect = ({ dsId, metric, value, onChange, width = "220px", variant = "unstyled", useCurrentTimerange = true }: LabelSelectProps) => {
    const [labels, setLabels] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadLabels(true)
    }, [metric])

    const loadLabels = async (force?) => {
        if (!force && labels.length > 0) {
            return
        }
        setLoading(true)
        const res = await queryDemoLabels(dsId, metric)
        setLoading(false)
        if (res.error) {
            setLabels([])
            return
        }
        setLabels(res.data)
    }

    return (
        <Box width={width} position="relative">
            <ChakraSelect value={{ value: value, label: value }} placeholder="Metrics" variant={variant} size="md" options={labels.map((m) => { return { label: m, value: m } })} onChange={v => onChange(v)}
            />
            {loading && <Box position="absolute" right="55%" top="6px  "><Loading size="sm" /></Box>}
        </Box>

    )
}