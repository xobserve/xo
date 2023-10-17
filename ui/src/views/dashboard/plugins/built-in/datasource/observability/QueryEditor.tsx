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
import { HStack, Input, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import { Form } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { cloneDeep } from "lodash"
import { useEffect, useState } from "react"
import { PanelQuery } from "types/dashboard"
import { DatasourceEditorProps } from "types/datasource"
import React from "react";
import { useStore } from "@nanostores/react"
import { PanelTypeAlert } from "../../panel/alert/types"
import { locale } from "src/i18n/i18n"
import InputSelect from "components/select/InputSelect"
import { MobileVerticalBreakpoint } from "src/data/constants"

const HttpQueryEditor = ({ panel, datasource, query, onChange }: DatasourceEditorProps) => {
    const code = useStore(locale)
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    const apiDesc = apiList.find(api => api.name == tempQuery.metrics)?.desc
    const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
    return (<>
        <Form spacing={1}>
            <FormItem title="API" labelWidth="100px" size="sm" alignItems={isMobileScreen ? "start" : "center"} flexDirection={isMobileScreen ? "column" : "row"}>
                <InputSelect value={tempQuery.metrics} options={apiList.map(api => ({ label: api.name, value: api.name, annotation: api.desc }))} annotationDir="vertical" onChange={v => {
                    const q = { ...tempQuery, metrics: v }
                    setTempQuery(q)
                    onChange(q)
                }} />
                {!isMobileScreen && apiDesc && <Text textStyle="annotation">{apiDesc}</Text>}
            </FormItem>
        </Form>
    </>)
}

export default HttpQueryEditor



const apiList = [{
    name: "getServiceInfoList",
    desc: "get service infos, such as p99 latency, errors, qps, render as a table",
}
]