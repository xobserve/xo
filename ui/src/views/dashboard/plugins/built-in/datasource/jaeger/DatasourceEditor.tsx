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
import { Input } from "@chakra-ui/react"
import FormItem from "src/components/form/Item"
import { Datasource } from "types/datasource"
import isURL from "validator/lib/isURL"
import React from "react";

interface Props {
    datasource: Datasource
    onChange: any
}
const defaultUrl = "http://localhost:16686"
const JaegerDatasourceEditor = ({datasource, onChange}: Props) => {
    if (datasource.url === null) {
        onChange(d => {d.url = defaultUrl})
        return 
    }
    return (<>
        <FormItem title="URL">
            <Input value={datasource.url} placeholder={defaultUrl} onChange={e => {
                const v = e.currentTarget.value
                onChange((d: Datasource) => { d.url = v })
            }} />
        </FormItem>
    </>)
}

export default JaegerDatasourceEditor

export const isJaegerDatasourceValid = (ds: Datasource) => {
    if (!isURL(ds.url, { require_tld: false })) {
        return 'invalid url'
    }
}