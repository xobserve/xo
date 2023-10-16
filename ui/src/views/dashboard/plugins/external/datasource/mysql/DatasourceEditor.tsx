// Copyright 2023 Datav.io Team
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

import { Input } from "@chakra-ui/react"
import FormItem from "src/components/form/Item"
import { Datasource } from "types/datasource"
import React from "react";
import { FormSection } from "components/form/Form";
import { Updater } from "use-immer";
import { isEmpty } from "lodash";

interface Props {
    datasource: Datasource
    onChange: Updater<Datasource>
}



const DatasourceEditor = ({ datasource, onChange }: Props) => {
    return (<>
        <FormSection title="Connection">
            <FormItem title="Host URL">
                <Input value={datasource.url} placeholder={"localhost:3306"} required onChange={e => {
                    const v = e.currentTarget.value
                    onChange((d: Datasource) => { d.url = v })
                }} />
            </FormItem>
        </FormSection>
        <FormSection title="Authentication">
            <FormItem title={"Database name"}>
                <Input value={datasource.data.database} placeholder="Database" onChange={e => {
                    const v = e.currentTarget.value
                    onChange((d: Datasource) => { d.data['database'] = v })
                }}
                />
            </FormItem>
            <FormItem title={"Username"}>
                <Input value={datasource.data.username} placeholder="Username" onChange={e => {
                    const v = e.currentTarget.value
                    onChange((d: Datasource) => { d.data['username'] = v })
                }}
                />
            </FormItem>
            <FormItem title={"Password"}>
                <Input value={datasource.data.password} placeholder="Password" type="password" onChange={e => {
                    const v = e.currentTarget.value
                    onChange((d: Datasource) => { d.data['password'] = v })
                }}
                />
            </FormItem>
        </FormSection>
    </>)
}


export default DatasourceEditor