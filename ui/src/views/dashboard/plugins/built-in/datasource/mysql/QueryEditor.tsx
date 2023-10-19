import { DatasourceEditorProps } from "types/datasource"
import { Box, HStack, Stack, Input, VStack, useMediaQuery, Button } from "@chakra-ui/react"
import { Form } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { IsSmallScreen } from "src/data/constants"
import CodeEditor from "src/components/CodeEditor/CodeEditor";
import React, { useState } from 'react'
import { cloneDeep } from 'lodash'
import { PanelQuery } from "types/dashboard"
import { useStore } from "@nanostores/react";
import { prometheusDsMsg } from "src/i18n/locales/en";
import SelectDataFormat from "../../../components/query-edtitor/SelectDataFormat";
import { AiFillCaretRight } from "react-icons/ai"

const QueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const t1 = useStore(prometheusDsMsg)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const [isSmallScreen] = useMediaQuery(IsSmallScreen)
    const isLargeScreen = !isSmallScreen

    return (
        <Form spacing={2}>
            <FormItem size="sm" title="query" spacing={isLargeScreen ? 4 : 1}>
                <Stack width="100%" alignItems={isLargeScreen ? "start" : "end"} height={"100%"}>
                    <Box width={isLargeScreen ? "calc(100% - 100px)" : "calc(100% - 5px)"} >
                        <CodeEditor
                            height="100%"                            
                            language="sql"
                            value={tempQuery.metrics}
                            onChange={(v) => {
                                setTempQuery({ ...tempQuery, metrics: v })
                            }}
                            isSingleLine
                            placeholder="enter mysql query"
                        />
                    </Box>
                </Stack>
            </FormItem>
            <Stack >
                <FormItem labelWidth={"150px"} size="sm" title="Legend" spacing={isLargeScreen ? 4 : 1}>
                    <Input
                        value={tempQuery.legend}
                        onChange={(e) => {
                            setTempQuery({ ...tempQuery, legend: e.currentTarget.value })
                        }}
                        width="100px"
                        placeholder={t1.legendFormat}
                        size="sm"
                    />
                </FormItem>
                <SelectDataFormat tempQuery={tempQuery} setTempQuery={setTempQuery} onChange={setTempQuery} spacing={isLargeScreen ? 4 : 1}/>
            </Stack>
            <HStack mt={1}>
                <Button
                    size={"sm"}
                    leftIcon={<AiFillCaretRight />}
                    variant='solid'
                    onClick={() => {
                        onChange(tempQuery)
                    }}>Run Query</Button>
            </HStack>
        </Form>
    )
}

export default QueryEditor