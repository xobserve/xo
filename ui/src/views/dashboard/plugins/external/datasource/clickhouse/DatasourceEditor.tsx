// Copyright 2023 observex.io Team
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
import { Input, Text } from "@chakra-ui/react"
import FormItem from "src/components/form/Item"
import { Datasource } from "types/datasource"
import React from "react";

interface Props {
    datasource: Datasource
    onChange: any
}

const defaultUrl = "localhost:9000"
const defaultData = {database: "default", username: "default", password: "" } 
const DatasourceEditor = ({ datasource, onChange }: Props) => {
    if (datasource.url === null) {
        onChange(d => { d.url = defaultUrl })
        return
    }

    if (!datasource.data) {
        onChange(d => { d.data = defaultData})
        return 
    }
    return (<>
        <Text>Clickhouse</Text>
        <FormItem title="URL">
            <Input value={datasource.url} placeholder={defaultUrl} onChange={e => {
                const v = e.currentTarget.value
                onChange((d: Datasource) => { d.url = v })
            }} />
        </FormItem>
        <FormItem title="Database">
            <Input value={datasource.data.database} onChange={e => {
                const v = e.currentTarget.value
                onChange((d: Datasource) => { d.data.database = v })
            }} placeholder="clickhouse database" />
        </FormItem>
        <FormItem title="Username">
            <Input value={datasource.data.username} placeholder="clickhouse username" onChange={e => {
                const v = e.currentTarget.value
                onChange((d: Datasource) => { d.data.username = v })
            }}/>
        </FormItem>
        <FormItem title="Password">
            <Input type="password" value={datasource.data.password} placeholder="clickhouse password" onChange={e => {
                const v = e.currentTarget.value
                onChange((d: Datasource) => { d.data.password = v })
            }}/>
        </FormItem>
    </>)
}

export default DatasourceEditor

