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

import React from "react";
import { Box } from "@chakra-ui/react"
import { PanelProps } from "types/dashboard"
import { LogStream } from "types/plugins/log";


interface LogPanelProps extends PanelProps {
    data: LogStream[][]
}

const LogPanel = (props: PanelProps) => {
    const data: LogStream[] = props.data.flat()

    console.log("here333333",data)
    return (<>
    </>)
}

export default LogPanel
