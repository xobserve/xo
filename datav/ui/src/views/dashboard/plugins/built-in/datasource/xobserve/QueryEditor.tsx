// Copyright 2023 xObserve.io Team
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
import { Box, HStack, Input, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useMediaQuery, VStack } from "@chakra-ui/react"
import { Form } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { cloneDeep } from "lodash"
import { useState } from "react"
import { PanelQuery } from "types/dashboard"
import { DatasourceEditorProps } from "types/datasource"
import React from "react";
import { useStore } from "@nanostores/react"
import { locale } from "src/i18n/i18n"
import InputSelect from "components/select/InputSelect"
import { MobileVerticalBreakpoint } from "src/data/constants"
import CodeEditor from "components/CodeEditor/CodeEditor"
import SelectDataFormat from "../../../components/query-edtitor/SelectDataFormat"
import { DataFormat } from "types/format"

const HttpQueryEditor = ({ panel, datasource, query, onChange }: DatasourceEditorProps) => {
    const code = useStore(locale)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const api = apiList.find(api => api.name == tempQuery.metrics)
    if (!tempQuery.data.enableVariableKeys && api?.name) {
        tempQuery.data.enableVariableKeys = [api.name]
        const q = cloneDeep(tempQuery)
        setTempQuery(q)
        onChange(q)
        return 
    }

    if (api && api.params) {
        if (!tempQuery.data[api.name]) {
            tempQuery.data[api.name] = {}
        }
        if (!tempQuery.data[api.name]['params']) {
            tempQuery.data[api.name]['params'] = api.params
            const q = cloneDeep(tempQuery)
            setTempQuery(q)
            onChange(q)
        }
    }

    if (!tempQuery.data['format']) {
        tempQuery.data['format'] = api?.format ?? DataFormat.Table
        const q = cloneDeep(tempQuery)
        setTempQuery(q)
        onChange(q)
    }

    const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
    return (<>
        <Form spacing={1}>
            <FormItem title="API" labelWidth="100px" size="sm" alignItems={isMobileScreen ? "start" : "center"} flexDirection={isMobileScreen ? "column" : "row"}>
                <InputSelect value={tempQuery.metrics} options={apiList.map(api => ({ label: api.name, value: api.name, annotation: api.desc }))} annotationDir="vertical" onChange={v => {
                    tempQuery.metrics = v
                    const api1 = apiList.find(api => api.name == v)
                    tempQuery.data.enableVariableKeys = [v]
                    if (!tempQuery.data[v]) {
                        tempQuery.data[v] = {}
                    }
                    if (!tempQuery.data[v]['params']) {
                        tempQuery.data[v]['params'] = api1.params
                    }

                    tempQuery.data['format'] = api1.format
                    const q = cloneDeep(tempQuery)
                    setTempQuery(q)
                    onChange(q)
                }} />
                {!isMobileScreen && api?.desc && <Text textStyle="annotation">{api.desc}</Text>}
            </FormItem>
            {api?.params && <FormItem title="Params" labelWidth="100px" size="sm" flexDirection={isMobileScreen ? "column" : "row"} desc={<TableContainer>
                <Table variant='simple' size="sm" className="color-border-table">
                    <Thead>
                        <Tr>
                            <Th>Param</Th>
                            <Th>Desc</Th>
                            <Th>Default</Th>
                            <Th>Allow values</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            api?.paramsDesc?.map(desc => <Tr>
                                <Td>{desc[0]}</Td>
                                <Td>{desc[1]}</Td>
                                <Td>{desc[2]}</Td>
                                <Td>{desc[3]}</Td>
                            </Tr>)
                        }
                    </Tbody>
                </Table>
            </TableContainer>}>
                <Box width={!isMobileScreen ? "calc(100% - 200px)" : "calc(100% - 180px)"}>
                    <CodeEditor
                        language="json"
                        value={tempQuery.data[tempQuery.metrics].params}
                        onChange={(v) => {
                            tempQuery.data[tempQuery.metrics]['params'] = v
                            const q = { ...tempQuery, data: cloneDeep(tempQuery.data) }
                            setTempQuery(q)
                        }}
                        onBlur={() => {
                            onChange(tempQuery)
                        }}
                        isSingleLine
                    />
                </Box>
            </FormItem>}

            <SelectDataFormat tempQuery={tempQuery} setTempQuery={setTempQuery} onChange={onChange} labelWidth="100px" />
        </Form>
    </>)
}

export default HttpQueryEditor



const domainParams = [
    ["namespace", "namespace name, can be an environment name, such as dev, test, prod etc","default",""],
    ["gropu", "group name, logical group of services","default",""],
]

export const apiList = [{
    name: "getServiceInfoList",
    desc: "get service infos, such as p99 latency, errors, qps, render as a table",
    params: `{
}`,
    paramsDesc: [
        ...domainParams,
        ["service", "filter by service names, e.g xobserve|driver"]
    ],
    format: DataFormat.Table
},

{
    name: "getNamespaces",
    desc: "get namespace list",
    params: `{
}`,
    paramsDesc: [],
    format: DataFormat.ValueList
},
{
    name: "getServiceNames",
    desc: "get service names, can be used in variable values",
    params: `{
}`,
    paramsDesc: [...domainParams],
    format: DataFormat.ValueList
},
{
    name: "getServiceOperations",
    desc: "get service operations",
    params: `{
}`,
    paramsDesc: [
        ...domainParams,
        ["service", "service name"]
    ],
    format: DataFormat.ValueList
},
{
    name: "getServiceRootOperations",
    desc: "get service root span operations",
    params: `{
}`,
    paramsDesc: [
        ...domainParams,
        ["service", "service name"]
    ],
    format: DataFormat.ValueList
},
{
    name: "getLogs",
    desc: "search logs with conditions",
    params: `{
}`,
    paramsDesc: [
        ...domainParams,
        ["service", "filter by service names, e.g xobserve|driver", "", ""],
        ["host", "filter by host names, e.g xobserve-1|xobserve-2", "", ""],
        ["severity", "logs severity, e.g error|info", "", "debug| info | warn | error | fatal"],
        ["perPage", "page size of logs when query from datasource", "100", "any number"],
        ["orderByTimestamp", "order by timestamp", "desc", "asc | desc"],
    ],
    format: DataFormat.Logs
},
{
    name: "getDependencyGraph",
    desc: "service dependency graph",
    params: `{
}`,
    paramsDesc: [
      ...domainParams,
        ["source", "service name list, e.g xobserve|mysql","",""],
        ["target", "service name list, e.g xobserve|mysql","",""]
    ],
    format: DataFormat.NodeGraph
},
{
    name: "getTraces",
    desc: "get traces list and statistics",
    params: `{
}`,
    paramsDesc: [
        ...domainParams,
    ],
    format: DataFormat.NodeGraph
}
]
