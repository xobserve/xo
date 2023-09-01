// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useStore } from "@nanostores/react"
import React, { memo } from "react"
import { useEffect, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import { dashboardMsg } from "src/i18n/locales/en"
import DashboardWrapper from "src/views/dashboard/Dashboard"
import { requestApi } from "utils/axios/request"
import NotFoundPage from "../NotFound"
import { AlertDashbordId } from "src/data/dashboard"


interface Props {
    sideWidth: number
}
// page for dispaly dashboard
const DashboardPage = memo(({sideWidth}: Props) => {
    const t1 = useStore(dashboardMsg)
    const location = useLocation()
    const [dashboardId, setDashboardId] = useState<string>(null)
    const [error, setError] = useState(null)
    useEffect(() => {
        if (location) {
            setError(null)
            if (location.pathname == '/alert') {
                setDashboardId(AlertDashbordId)
            } else  {   
                setDashboardId(null)
                let path = location.pathname;
                // if rawId  starts with 'd-', then it's a dashboard id
                // otherwise, it's just a pathname defined in team's sidemenu, we need to get the real dashboard id
                if (path.startsWith('/d-')) {
                    setDashboardId(path.substring(1))
                } else {
                    load(path)
                }
            }
           
        }
    }, [location.pathname])

    const load = async path => {
        const res = await requestApi.get(`/team/sidemenu/current`)
        let menuitem;
        if (res.data) {
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
        }
        

        if (!menuitem) {
            setError(t1.notFound)
            return
        }

        setDashboardId(menuitem.dashboardId)
    }

    return (
        <>
            {dashboardId && <DashboardWrapper key={dashboardId} sideWidth={sideWidth} dashboardId={dashboardId} />}
            {error && <NotFoundPage message={error} />}
        </>
    )
})

export default DashboardPage



