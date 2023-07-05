import { FormLabel, HStack, Input, VStack } from "@chakra-ui/react"
import FormItem from "components/form/Item"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { PanelQuery, PanelType } from "types/dashboard"
import { DatasourceEditorProps } from "types/datasource"
import { useImmer } from "use-immer"

const JaegerQueryEditor = ({ panel, query, onChange }: DatasourceEditorProps) => {
    const [tempQuery, setTempQuery] = useImmer<PanelQuery>(cloneDeep(query))

    switch (panel.type) {
        case PanelType.NodeGraph:

            return (<VStack alignItems="left" spacing="1">
                <FormItem labelWidth="200px" title="Show services" desc="Show services and their relations, you can enter multiple services, sperated with comma, leave empty if you want to show all">
                    <Input value={tempQuery.data.showServices}  onChange={e => {
                        const v = e.target.value
                        setTempQuery(q => { q.data.showServices = v })
                    }} onBlur={() => {
                        onChange(tempQuery)
                    }} placeholder="e.g mysql,redis"/>
                </FormItem>
            </VStack>)

        default:
            return (<VStack alignItems="left" spacing="1">

            </VStack>)
    }

}

export default JaegerQueryEditor