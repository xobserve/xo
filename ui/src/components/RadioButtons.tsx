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
import { Button, HStack, Wrap } from "@chakra-ui/react"
import React from "react"

interface Props {
    options: Option[]
    value: string | boolean // selected value
    onChange: any
    size?: "xs" | "sm" | "md" | "lg"
    spacing?: number
    fontSize?: string
    theme?: "brand" | "default"
    width?: number
}

interface Option {
    label: string
    value: string | boolean
}

const RadionButtons = ({ options, value, onChange, size = "md", spacing = 1, fontSize = "0.9rem", theme = "default", width=null }: Props) => {
    return (<Wrap spacing={spacing} width={width}>
        {options.map(o => <Button key={o.label}  fontWeight={size != "xs" ? 550 : 400} fontSize={fontSize} size={size} onClick={() => onChange(o.value)} borderRadius="0" variant={value == o.value ? "solid" : (theme == "default" ? "outline" : "ghost")} colorScheme={theme == "default" ? "gray" : "brand"}>{o.label}</Button>)}
    </Wrap>)
}

export default RadionButtons