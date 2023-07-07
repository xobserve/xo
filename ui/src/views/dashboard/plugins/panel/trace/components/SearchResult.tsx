import { Panel } from "types/dashboard"
import { Trace } from "types/plugins/trace"
import SearchResultPlot from "./SearchResultPlot"
import { TimeRange } from "types/time"
import { Box, Flex, Text } from "@chakra-ui/react"

interface Props {
    panel: Panel
    traces: Trace[]
    timeRange: TimeRange
}
const TraceSearchResult = ({panel, traces,timeRange}:Props) => {
    console.log("here3333 traces:",traces)
    return (<Box pl="2">
        <SearchResultPlot traces={traces} timeRange={timeRange}/>
        <Box pl="2" pr="20px">
            <Flex alignItems="center" justifyContent="space-between">
                <Text>{traces.length} Traces</Text>
                <Text>Sort</Text>
            </Flex>

        </Box>
    </Box>)
}

export default TraceSearchResult