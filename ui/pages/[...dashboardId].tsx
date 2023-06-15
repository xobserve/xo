
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import DashboardWrapper from "src/views/dashboard/Dashboard"
import { requestApi } from "utils/axios/request"
import NotFoundPage from "./404"


// page for dispaly dashboard
const DashboardPage = () => {
    const router = useRouter()
    const rawId = router.query.dashboardId
    const [dashboardId, setDashboardId] = useState<string>(null)
    const [error, setError] = useState(null)
    useEffect(() => {
        if (rawId) {
            setDashboardId(null)
            let path = window.location.pathname;
            // if rawId  starts with 'd-', then it's a dashboard id
            // otherwise, it's just a pathname defined in team's sidemenu, we need to get the real dashboard id
            if (path.startsWith('/d-')) {
                setDashboardId(path.substring(1))
            } else {
                load(path)
            }
        }
    }, [rawId])

    const load = async path => {
        const res = await requestApi.get(`/team/sidemenu/current`)
        let menuitem;
        for (const item of res.data.data) {
            if (item.url == path) {
                menuitem = item
            } else {
                if (item.children) {
                    for (const child of item.children) {
                        if (child.url == path) {
                            menuitem = child
                            break
                        }
                    }
                }
            }

            if (menuitem) break
        }

        if (!menuitem) {
            setError('Dashboard not found')
            return
        }

        setDashboardId(menuitem.dashboardId)
    }
    return (
        <>
            {dashboardId && <DashboardWrapper dashboardId={dashboardId} />}
            {error && <NotFoundPage message={error} />}
        </>
    )
}

export default DashboardPage



