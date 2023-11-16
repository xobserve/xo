// Copyright 2023 xObserve.io Team
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
import React, { memo, useMemo } from "react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { dashboardMsg } from "src/i18n/locales/en"
import DashboardWrapper from "src/views/dashboard/Dashboard"
import NotFoundPage from "../NotFound"
import { AlertDashbordId } from "src/data/dashboard"
import { $config, UIConfig } from "src/data/configs/config"
import { Box, useToast } from "@chakra-ui/react"
import Loading from "components/loading/Loading"
import { first } from "lodash"
import { isEmpty } from "utils/validate"
import { Dashboard } from "types/dashboard"
import { requestApi } from "utils/axios/request"
import { $teams } from "src/views/team/store"
import { $datasources } from "src/views/datasource/store"
import { initVariableSelected } from "src/views/variables/SelectVariable"
import { $variables } from "src/views/variables/store"



interface Props {
    sideWidth: number
}


// page for dispaly dashboard
const DashboardPage = memo(({ sideWidth }: Props) => {
    const config = useStore($config)
    const navigate = useNavigate()
    const t1 = useStore(dashboardMsg)
    const location = useLocation()
    const [dashboardId, setDashboardId] = useState<string>(null)
    const [error, setError] = useState(null)
    const teamId = useParams().teamId
    const [dashboard, setDashboard] = useState<Dashboard>(null)

    useEffect(() => {
        const teamPath = `/${teamId ?? config.currentTeam}`
        if (location && config.sidemenu) {
            if (!isEmpty(teamId) && isNaN(Number(teamId))) {
                setError("Invailid team id")
                return
            }

            let path = location.pathname.replace(`/${teamId}`, '')
            setError(null)
            if (path == '' || path == '/') {
                const m = first(config.sidemenu)
                if (m) {
                    if (!m.children) {
                        navigate(teamPath + m.url)
                    } else {
                        const child = first(m.children)
                        if (child) navigate(teamPath + child.url)
                    }
                } else {
                    navigate(`/${config.currentTeam}`)
                    setError(t1.noDashboardExist)
                }
                return
            } else if (path == '/alert') {
                setDashboardId(AlertDashbordId)
            } else {
                setDashboardId(null)
                // if rawId  starts with 'd-', then it's a dashboard id
                // otherwise, it's just a pathname defined in team's sidemenu, we need to get the real dashboard id
                if (path.startsWith('/d-')) {
                    setDashboardId(path.substring(1))
                } else {
                    load(path)
                }
            }

        }
    }, [location.pathname, config])

    useEffect(() => {
        if (dashboardId) {
            loadDashboardConfig()
        }
    },[dashboardId])
    const load = path => {
        let menuitem;
        for (const item of config.sidemenu) {
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
            setError(t1.notFound)
            return
        }

        setDashboardId(menuitem.dashboardId)
    }


    const loadDashboardConfig = async () => {
        const res = await requestApi.get(`/dashboard/config/${dashboardId}`)
        $teams.set(res.data.teams)
        $datasources.set(res.data.datasources)
        initVariableSelected(res.data.variables)
        $variables.set(res.data.variables)
        setDashboard(res.data.dashboard)
    }

    return (
        <>
            {dashboard && <DashboardWrapper key={dashboardId} sideWidth={sideWidth} rawDashboard={dashboard} />}
            {error && <NotFoundPage message={error} />}
            {!dashboard && !error && <Box position="fixed" top="50vh" left="50vw"><Loading /></Box>}
        </>
    )
})

export default DashboardPage


