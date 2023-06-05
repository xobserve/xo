
import DashboardWrapper from "src/views/dashboard/Dashboard"
import { useRouter } from "next/router"


const DashboardPage = () => {
    const router = useRouter()
    const dashboardId = router.query.dashboardId

    return (
        <>
            {dashboardId && <DashboardWrapper dashboardId={dashboardId}/>}    
        </>
    )
}

export default DashboardPage



