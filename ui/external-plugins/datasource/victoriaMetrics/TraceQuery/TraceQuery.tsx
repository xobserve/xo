import React, { memo } from "react"
import NestedNav from "./NestedNav"
import Trace, { TracingData } from "./types"

const TraceQuery = memo(({data, query}: {data: TracingData; query: string}) => {
    console.log("here33333:",query)
    const trace = new Trace(data, query)

    return (<>
        {trace && <NestedNav
          trace={trace}
          totalMsec={trace.duration}
        />}
    </>)
})

export default TraceQuery


