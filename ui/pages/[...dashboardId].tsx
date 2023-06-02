
import DashboardWrapper from "components/dashboard/Dashboard"
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



