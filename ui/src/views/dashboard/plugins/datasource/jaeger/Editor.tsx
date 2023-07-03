import { HStack, Input, VStack } from "@chakra-ui/react"
import Label from "components/form/Item"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { PanelQuery } from "types/dashboard"
import { DatasourceEditorProps } from "types/datasource"

const JaegerQueryEditor = ({query,onChange}:DatasourceEditorProps) => {  
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    
    return (  
        <VStack alignItems="left" spacing="1">
           
       </VStack>
)
}

export default JaegerQueryEditor