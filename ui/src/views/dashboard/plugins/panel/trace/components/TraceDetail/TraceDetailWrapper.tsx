import { useEffect, useState } from "react"
import { Trace } from "types/plugins/trace"
import { queryJaegerTrace } from "../../../../datasource/jaeger/query_runner"
import { datasources } from "src/views/App"
import { DatasourceType } from "types/dashboard"
import TraceDetail from "./TraceDetail"
import transformTraceData from "../../utils/transform-trace-data"
import ScrollManager from "./scroll/scrollManager"
import { cancel as cancelScroll, scrollBy, scrollTo } from './scroll/scrollPage';

const TraceDetailWrapper = ({id,dsId}) => {
    const [trace, setTrace] = useState<Trace>(null)
    const [scrollManager, setScrollManager] = useState(null)
    const datasource = datasources.find(ds => ds.id == dsId)
    useEffect(() => {
        load()

        return () => {
            if (scrollManager) {
                scrollManager.current.destroy();
                scrollManager.current = new ScrollManager(undefined, {
                    scrollBy,
                    scrollTo,
                });
            }
        }
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
        const sm = new ScrollManager(data, {
            scrollBy,
            scrollTo,
        });
        setScrollManager(sm)
    }

    return (<>
        {trace && scrollManager && <TraceDetail trace={trace} scrollManager={scrollManager}/>}
    </>)
}

export default TraceDetailWrapper



