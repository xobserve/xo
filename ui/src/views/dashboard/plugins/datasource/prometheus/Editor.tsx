import { Box, HStack, Input, VStack } from "@chakra-ui/react"
import Label from "components/form/Label"
import { cloneDeep } from "lodash"
import { useEffect, useState } from "react"
import {  PanelQuery } from "types/dashboard"

import { Variant } from "chakra-react-select/dist/types/types"
import { Datasource, DatasourceEditorProps } from "types/datasource"
import { queryPrometheusAllMetrics, queryPrometheusLabels } from "./query_runner"
import ChakraSelect from "components/select/ChakraSelect"



const PrometheusQueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))

    return (
        <VStack alignItems="left" spacing="1">
            <HStack>
                <Label py="0"><PromMetricSelect dsId={datasource.id} value={tempQuery.metrics} onChange={v => {
                    setTempQuery({ ...tempQuery, metrics: v })
                    onChange({ ...tempQuery, metrics: v })
                }} /></Label>
                <Input
                    value={tempQuery.metrics}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, metrics: e.currentTarget.value })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    width="100%"
                    placeholder="Enter a PromQL query"
                    size="sm"
                />
            </HStack>
            <HStack>
                <Label width="150px">Legend</Label>
                <Input
                    value={tempQuery.legend}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, legend: e.currentTarget.value })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    width="150px"
                    placeholder="Legend format"
                    size="sm"
                />
            </HStack>
        </VStack>
    )
}

export default PrometheusQueryEditor


interface MetricSelectProps {
    dsId: number
    value: string
    onChange: any
    width?: string
    variant?: Variant
    useCurrentTimerange?: boolean
}

export const PromMetricSelect = ({ dsId, value, onChange, width = "220px", variant = "unstyled", useCurrentTimerange = true }: MetricSelectProps) => {
    const [metricsList, setMetricsList] = useState<string[]>([])




    const loadMetrics = async () => {
        if (metricsList.length > 0) {
            return
        }

        const res = await queryPrometheusAllMetrics(dsId)
        setMetricsList(res)
    }

    return (
        <Box onClick={loadMetrics} width={width}>
            <ChakraSelect isClearable value={{ value: value, label: value }} placeholder="Metrics" variant={variant} size="sm" options={metricsList.map((m) => { return { label: m, value: m } })} onChange={v => onChange(v)}
            />
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

    useEffect(() => {
        loadLabels(true)
    }, [metric])

    const loadLabels = async (force?) => {
        if (!force && labels.length > 0) {
            return
        }

        const res = await queryPrometheusLabels(dsId, metric)
        setLabels(res)
    }

    return (
        <Box onClick={loadLabels} width={width}>
            <ChakraSelect value={{ value: value, label: value }}  placeholder="Metrics" variant={variant} size="sm" options={labels.map((m) => { return { label: m, value: m } })} onChange={v => onChange(v)}
            />
        </Box>

    )
}