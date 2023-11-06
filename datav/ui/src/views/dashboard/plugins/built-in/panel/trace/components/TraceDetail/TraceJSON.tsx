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

import { Box, Button, HStack } from "@chakra-ui/react";
import CodeEditor from "src/components/CodeEditor/CodeEditor";
import { cloneDeep } from "lodash";
import { useState } from "react";
import { Trace } from "src/views/dashboard/plugins/built-in/panel/trace/types/trace";
import React from "react";

const TraceJSON = ({ trace }: { trace: Trace }) => {
    const [hideLogs, setHideLogs] = useState(false)
    const [hideRefs, setHideRefs] = useState(true)

    const onHideLogs = () => {
        setHideLogs(!hideLogs)
    }

    const onHideRefs = () => {
        setHideRefs(!hideRefs)
    }

    const filterTrace = cloneDeep(trace)
    if (hideLogs) {
        filterTrace.spans.forEach(span => {
            delete (span.logs)
        })
    }
    if (hideRefs) {
        filterTrace.spans.forEach(span => {
            delete (span.references)
        })
    }

    return <Box height="calc(100vh - 123px)">
        <HStack py="2">
            <Button size="sm" variant={hideLogs ? "solid" : "outline"} onClick={onHideLogs}>Hide span logs</Button>
            <Button size="sm" variant={hideRefs ? "solid" : "outline"} onClick={onHideRefs}>Hide span references</Button>
        </HStack>
        <Box height="100%">
            <CodeEditor value={JSON.stringify(filterTrace, null, 2)} onChange={v => null} language="json" readonly />
        </Box>
    </Box>
}

export default TraceJSON