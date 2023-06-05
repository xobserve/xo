import { Box, HStack, Input, Text, Textarea, VStack } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import Label from "components/label/Label"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { Panel, PanelDatasource, PanelQuery } from "types/dashboard"

interface Props {
    query : PanelQuery
    onChange: any
}

const PrometheusQueryEditor = ({query,onChange}:Props) => {  
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    
    return (  
        <VStack alignItems="left" spacing="1">
            <HStack>
                <Label>Metrics</Label>
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
                <Label>Legend</Label>
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