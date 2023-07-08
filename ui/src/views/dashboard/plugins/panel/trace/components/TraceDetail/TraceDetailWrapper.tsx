import { useEffect, useState } from "react"
import { Trace } from "types/plugins/trace"
import { queryJaegerTrace } from "../../../../datasource/jaeger/query_runner"
import { datasources } from "src/views/App"
import { DatasourceType } from "types/dashboard"
import TraceDetail from "./TraceDetail"
import transformTraceData from "../../utils/transform-trace-data"


const TraceDetailWrapper = ({id,dsId}) => {
    const [trace, setTrace] = useState<Trace>(null)
    const datasource = datasources.find(ds => ds.id == dsId)
    useEffect(() => {
        load()
    },[])

    const load = async () => {
        let data
        switch (datasource.type) {
            case DatasourceType.Jaeger:
                const res = await queryJaegerTrace(dsId, id)
             
                if (res.length > 0) {
                    data = transformTraceData(res[0])
                }
            default:
                break;
        }

        setTrace(data)
    }

    return (<>
        {trace && <TraceDetail trace={trace}/>}
    </>)
}

export default TraceDetailWrapper



