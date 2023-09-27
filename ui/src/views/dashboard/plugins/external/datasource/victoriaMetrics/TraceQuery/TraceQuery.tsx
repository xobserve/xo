import React, { useEffect, useState } from "react"
import vmData from "./mockData.json"
import NestedNav from "./NestedNav"
import Trace, { TracingData } from "./types"

const TraceQuery = () => {
    const [trace, setTrace] = useState<Trace>(null)
    useEffect(() => {
        //@ts-ignore
        const traceData: TracingData = vmData.trace
        setTrace(new Trace(traceData, "go_gc_duration_seconds"))
         
    },[])


    return (<>
        {trace && <NestedNav
          trace={trace}
          totalMsec={trace.duration}
        />}
    </>)
}

export default TraceQuery


