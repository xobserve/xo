import { DatasourceEditorProps } from "types/datasource"
import { Box, HStack, Stack, Input, VStack, useMediaQuery } from "@chakra-ui/react"
import { Form } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { IsSmallScreen } from "src/data/constants"
import CodeEditor from "src/components/CodeEditor/CodeEditor";
import React, { useState } from 'react'
import { cloneDeep } from 'lodash'
import { PanelQuery } from "types/dashboard"
import { useStore } from "@nanostores/react";
import { prometheusDsMsg } from "src/i18n/locales/en";

const QueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const t1 = useStore(prometheusDsMsg)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const [isSmallScreen] = useMediaQuery(IsSmallScreen)
    const isLargeScreen = !isSmallScreen

    return (
        <Form spacing={1}>
            <FormItem size="sm" title="query">
                <Stack width="100%" alignItems={isLargeScreen ? "center" : "end"}>
                    <Box width={isLargeScreen ? "calc(100% - 100px)" : "calc(100% - 5px)"}>
                        <CodeEditor
                            language="sql"
                            value={tempQuery.metrics}
                            onChange={(v) => {
                                setTempQuery({ ...tempQuery, metrics: v })
                            }}
                            onBlur={() => {
                                onChange(tempQuery)
                            }}
                            isSingleLine
                            placeholder="enter mysql query"
                        />
                    </Box>
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
            </Stack>
        </Form>
    )
}

export default QueryEditor