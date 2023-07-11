import { Box, Button, HStack } from "@chakra-ui/react";
import CodeEditor from "components/CodeEditor/CodeEditor";
import { cloneDeep } from "lodash";
import { useState } from "react";
import { Trace } from "types/plugins/trace";

const TraceJSON = ({ trace }: { trace: Trace }) => {
    const [hideLogs, setHideLogs] = useState(false)
    const [hideRefs, setHideRefs] = useState(false)

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

    const v = JSON.stringify(filterTrace, null, 2)
    return <Box height="calc(100vh - 123px)">
        <HStack py="2">
            <Button size="sm" variant={hideLogs ? "solid" : "outline"} onClick={onHideLogs}>Hide span logs</Button>
            <Button size="sm" variant={hideRefs ? "solid" : "outline"} onClick={onHideRefs}>Hide span references</Button>
        </HStack>
        <Box height="100%">
            <CodeEditor value={v} onChange={v => null} language="json" readonly />
        </Box>
    </Box>
}

export default TraceJSON