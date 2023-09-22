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
import { Box } from "@chakra-ui/react"
import { MarkdownRender } from "src/components/markdown/MarkdownRender"
import { PanelProps } from "types/dashboard"
import { replaceWithVariables } from "utils/variable"
import React from "react";
import { defaultsDeep } from "lodash";
import { DemoPlugin } from "./types";


const initSettings = {
    disableDatasource: true, // whether display datasource editor in panel editor
    md: `## This is just a simple demo for how to develop Datav's external panel plugin \n\n For more info please visit https://github.com/data-observe/datav/wiki/External-plugins`,
    justifyContent: "left",
    alignItems: "top",
    fontSize: '1.2em',
    fontWeight: '500',
}

const DemoPanel = (props: PanelProps) => {
    const {panel} = props
    props.panel.plugins[panel.type] = defaultsDeep(props.panel.plugins[panel.type], initSettings)
    const options: DemoPlugin = props.panel.plugins[panel.type]
    return (<Box px="2" height="100%" id="text-panel" display="flex" alignItems={options.alignItems} justifyContent={options.justifyContent} >
        <MarkdownRender fontSize={options.fontSize} fontWeight={options.fontWeight} md={replaceWithVariables(options.md ?? "")} width="100%"/>
    </Box>)
}

export default DemoPanel
