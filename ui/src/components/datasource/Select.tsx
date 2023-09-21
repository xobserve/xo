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
import { Image } from "@chakra-ui/react"
import {  chakraComponents } from "chakra-react-select"
import { Variant } from "chakra-react-select/dist/types/types"
import InputSelect from "src/components/select/InputSelect"
import React from "react"
import { DatasourceType } from "types/dashboard"
import { useStore } from "@nanostores/react"
import { $datasources } from "src/views/datasource/store"
import { $teams } from "src/views/team/store"

interface Props {
    value: number
    onChange: any
    allowTypes?: DatasourceType[]
    variant?: Variant
    size?: "sm" | "md" | "lg"
}

const DatasourceSelect = ({ value, onChange, allowTypes = [], variant = "unstyled",size="md" }: Props) => {
    const datasources = useStore($datasources)
    const teams = $teams.get()
    const options = []
    datasources.forEach((ds) => {
        if (allowTypes.length > 0 && !allowTypes.includes(ds.type)) {
            return
        }
        
        options.push({
            label: ds.name,
            value: ds.id,
            icon: <Image width="30px" height="30px" mr="2" src={`/plugins/datasource/${ds.type}.svg`} />,
            annotation: teams.find(t => ds.teamId == t.id)?.name,
        })
    })


    return (
        <InputSelect width="100%"  isClearable value={value?.toString()} label={datasources.find(ds => ds.id == value)?.name} placeholder={"select datasource, support variable"}  size="md" options={options} onChange={onChange} enableInput />
    // <ChakraSelect value={{ value: value, label: datasources.find(ds => ds.id == value)?.name }} placeholder="select datasource" variant={variant} size={size} options={options}
    //     onChange={onChange}
    //     components={customComponents}
    // />
    )
}

export default DatasourceSelect


const customComponents = {
    Option: ({ children, ...props }) => (
        //@ts-ignore
        <chakraComponents.Option {...props}>
            {props.data.icon} {children}
        </chakraComponents.Option>
    ),
};