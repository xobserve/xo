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
    dashboard?: Dashboard
    sideWidth: number
}

const DashboardPageWrapper = memo(({ sideWidth }: Props) => {
    const teamId0 = Number(useParams().teamId)
    const teamId = isNaN(teamId0) ? 0 : teamId0
    let path = location.pathname.replace(`/${teamId}`, '')

    const [dashboard, setDashboard] = useState<Dashboard>(null)
    const [error, setError] = useState<string>(null)

    useEffect(() => {
        loadConfig(path)
    }, [])

    const loadConfig = async (path) => {
        const res = await requestApi.get(`/config/dashboard?teamId=${teamId}&path=${path}`)
        const cfg = res.data.cfg
        cfg.sidemenu = (cfg.sidemenu as any).data.filter((item) => !item.hidden)
        $config.set(cfg)
        $teams.set(res.data.teams)
        $datasources.set(res.data.datasources)
        initVariableSelected(res.data.variables)
        $variables.set(res.data.variables)
        setDashboard(res.data.dashboard)
        if (res.data.path != path) {
            window.history.replaceState(null, null, "/" + res.data.cfg.currentTeam + res.data.path)
        }
    }
    return (<>
        {dashboard && <DashboardWrapper key={dashboard.id} sideWidth={sideWidth} rawDashboard={dashboard} />}
        {error && <NotFoundPage message={error} />}
        {!dashboard && !error && <Box position="fixed" top="50vh" left="50vw"><Loading /></Box>}
    </>)
})

export default DashboardPageWrapper





