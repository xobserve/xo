import { Trace } from "types/plugins/trace"
import { cacheAs, Digraph, LayoutManager } from '@jaegertracing/plexus';

interface Props {
    traceA: Trace
    traceB: Trace
}
const TraceCompareGraph = ({traceA, traceB}: Props) => {
    return (<></>)
}

export default TraceCompareGraph