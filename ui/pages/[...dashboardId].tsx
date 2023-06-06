
import DashboardWrapper from "src/views/dashboard/Dashboard"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { requestApi } from "utils/axios/request"
import NotFoundPage  from "./404"

const DashboardPage = () => {
    const router = useRouter()
    console.log(router)
    const rawId = router.query.dashboardId
    const [dashboardId, setDashboardId] = useState<string>(null)
    const [error, setError] = useState(null)
    useEffect(() => {
        if (rawId) {
            let path = window.location.pathname;
            // if rawId  starts with 'd-', then it's a dashboard id
            // otherwise, it's just a pathname defined in team's sidemenu, we need to get the real dashboard id
            if (path.startsWith('/d-')) {
                setDashboardId(path.substring(1))
            } else {
                load(path)
            }
        }
    },[rawId])

    const load = async path => {
          const res = await requestApi.get(`/team/sidemenu/current`)
          console.log(res.data)
          const menuitem = res.data.data.find(item => item.url == path)
          if (!menuitem) {
             setError('Dashboard not found')
             setDashboardId(null)
             return 
          }
          setDashboardId(menuitem.dashboardId)
    }
    return (
        <>
            {dashboardId && <DashboardWrapper dashboardId={dashboardId}/>}    
            {error && <NotFoundPage />}
        </>
    )
}

export default DashboardPage



