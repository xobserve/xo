import { Panel } from "types/dashboard"
import { Trace } from "types/plugins/trace"
import SearchResultPlot from "./SearchResultPlot"
import { TimeRange } from "types/time"

interface Props {
    panel: Panel
    traces: Trace[]
    timeRange: TimeRange
}
const TraceSearchResult = ({panel, traces,timeRange}:Props) => {
    console.log("here3333 traces:",traces)
    return (<>
        <SearchResultPlot traces={traces} timeRange={timeRange}/>
    </>)
}

export default TraceSearchResult