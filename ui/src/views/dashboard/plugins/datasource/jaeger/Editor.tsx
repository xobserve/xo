import { FormLabel, HStack, Input, VStack } from "@chakra-ui/react"
import FormItem from "components/form/Item"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { PanelQuery, PanelType } from "types/dashboard"
import { DatasourceEditorProps } from "types/datasource"
import { useImmer } from "use-immer"
import React from "react";
import { useStore } from "@nanostores/react"
import { jaegerDsMsg } from "src/i18n/locales/en"

const JaegerQueryEditor = ({ panel, query, onChange }: DatasourceEditorProps) => {
    const t1 = useStore(jaegerDsMsg)
    const [tempQuery, setTempQuery] = useImmer<PanelQuery>(cloneDeep(query))

    switch (panel.type) {
        case PanelType.NodeGraph:

            return (<VStack alignItems="left" spacing="1">
                <FormItem labelWidth="200px" title={t1.showServices} desc={t1.showServicesTips}>
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