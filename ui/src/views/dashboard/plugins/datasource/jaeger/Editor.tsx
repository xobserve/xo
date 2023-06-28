import { HStack, Input, VStack } from "@chakra-ui/react"
import Label from "components/form/Label"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { PanelQuery } from "types/dashboard"
import { DatasourceEditorProps } from "types/datasource"

const JaegerQueryEditor = ({query,onChange}:DatasourceEditorProps) => {  
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

export default JaegerQueryEditor