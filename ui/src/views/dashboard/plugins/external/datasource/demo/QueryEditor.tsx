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
import { Box, HStack, Input, VStack, useMediaQuery, useToast } from "@chakra-ui/react"
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
import { MobileBreakpoint } from "src/data/constants";
import Loading from "components/loading/Loading";



const QueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const t1 = useStore(prometheusDsMsg)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    return (
        <Form spacing={1}>
            <FormItem size="sm" title={<PromMetricSelect  enableInput={false} width={isLargeScreen ? "300px" : "100px"} dsId={datasource.id} value={tempQuery.metrics} onChange={v => {
                setTempQuery({ ...tempQuery, metrics: v })
                onChange({ ...tempQuery, metrics: v })
            }} />} >
                <Box width="100%">
                    <CodeEditor
                        language={LogqlLang}
                        value={tempQuery.metrics}
                        onChange={(v) => {
                            setTempQuery({ ...tempQuery, metrics: v })
                        }}
                        onBlur={() => {
                            onChange(tempQuery)
                        }}
                        height="70px"
                        isSingleLine
                        placeholder={t1.enterPromQL}
                    />
                </Box>
                {/* <Input
                    value={tempQuery.metrics}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, metrics: e.currentTarget.value })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    width="100%"
                    placeholder={t1.enterPromQL}
                    size="sm"
                /> */}
            </FormItem>
            <HStack>
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
                {isLargeScreen && <ExpandTimeline t1={t1} tempQuery={tempQuery} setTempQuery={setTempQuery} onChange={onChange}/>}
            </HStack>
            {!isLargeScreen && <ExpandTimeline t1={t1} tempQuery={tempQuery} setTempQuery={setTempQuery} onChange={onChange}/>}
        </Form>
    )
}

export default QueryEditor


const ExpandTimeline = ({t1, tempQuery,setTempQuery,onChange}) => {
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
            {loading && <Box position="absolute" right="50%" top="6px  "><Loading size="sm"/></Box>}
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
    const toast = useToast()
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
        <Box  width={width} position="relative">
            <ChakraSelect value={{ value: value, label: value }} placeholder="Metrics" variant={variant} size="md" options={labels.map((m) => { return { label: m, value: m } })} onChange={v => onChange(v)}
            />
            {loading && <Box position="absolute" right="55%" top="6px  "><Loading size="sm"/></Box>}
        </Box>

    )
}