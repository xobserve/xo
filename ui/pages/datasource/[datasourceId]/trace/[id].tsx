import { useRouter } from "next/router"
import TraceDetailWrapper from "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceDetailWrapper"



const TracePage = () => {
    const router = useRouter()
    return (router.query.id && router.query.datasourceId && <TraceDetailWrapper id={router.query.id} dsId={router.query.datasourceId}/>)
}

export default TracePage