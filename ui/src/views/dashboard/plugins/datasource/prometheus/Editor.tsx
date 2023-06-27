import { Box, HStack, Input,VStack } from "@chakra-ui/react"
import { getInitTimeRange } from "components/TimePicker"
import Label from "components/form/Label"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { PanelQuery } from "types/dashboard"
import {
    Select,
  } from "chakra-react-select";

interface Props {
    query : PanelQuery
    onChange: any
}

const PrometheusQueryEditor = ({query,onChange}:Props) => {  
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const [metricsList, setMetricsList] = useState<string[]>([])
    const loadMetrics = async () => {
        if (metricsList.length > 0) {
            return 
        }

        const timeRange = getInitTimeRange()
        const start = timeRange.start.getTime() / 1000
        const end = timeRange.end.getTime() / 1000
        const res0 = await fetch(`http://localhost:9090/api/v1/label/__name__/values?start=${start}&end=${end}`)
        const res = await res0.json()
        if (res.status == "success") {
            setMetricsList(res.data)
        }
    }

    return (  
        <VStack alignItems="left" spacing="1">
            <HStack>
                <Label  py="0"><Box onClick={loadMetrics} width="220px"><Select menuPlacement="bottom" placeholder="Metrics" variant="unstyled" size="sm" options={metricsList.map((m) => {return {label: m, value: m}})} onChange={(v) => {
                    setTempQuery({...tempQuery, metrics: v.value})
                    onChange({...tempQuery, metrics:v.value})
                    }} 
                    /></Box></Label>
                <Input 
                    value={tempQuery.metrics} 
                    onChange={(e) => {
                    setTempQuery({...tempQuery, metrics: e.currentTarget.value})
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
                    setTempQuery({...tempQuery, legend: e.currentTarget.value})
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